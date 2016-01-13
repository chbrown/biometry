import moment from 'moment';
import React from 'react';
import {connect} from 'react-redux';
import {metry_host, OperationType, Action, ActionJSON, raiseAction, Actiontype} from '../types';

const defaultHeaders = new Headers({'Content-Type': 'application/json'});

/**
@returns {number} A mixture of day-granularity timestamp (meaning, it will repeat from
one day to the next) and randomness, but still considerably smaller than the
maximum safe integer. It will be positive.

P.S. const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
*/
function randInt() {
  return (new Date() % 10000000) * 1000 + (Math.random() * 1000 | 0);
}

function groupBy(xs, keyFn) {
  var hash = {};
  xs.forEach(x => {
    var key = keyFn(x);
    var list = hash[key];
    if (list === undefined) {
      list = hash[key] = [];
    }
    list.push(x);
  });
  return hash;
}

function createRange(start: moment.Moment, end: moment.Moment, duration: moment.Duration): moment.Moment[] {
  var range: moment.Moment[] = [];
  var cursor = start.clone();
  do {
    range.push(cursor.clone());
    cursor.add(duration);
  } while (cursor.isBefore(end));
  // range.push(end.clone());
  return range;
}

function fetchActions({start, end}: {start?: moment.Moment, end?: moment.Moment}): Promise<Action[]> {
  let url = `${metry_host}/actions?start=${start.toISOString()}&end=${end.toISOString()}`;
  return fetch(url).then(res => res.json())
  .then((actions_json: ActionJSON) => actions_json.map(raiseAction));
}

function fetchActiontypes(): Promise<Actiontype[]> {
  return fetch(`${metry_host}/actiontypes`).then(res => res.json());
}

function syncActions(actions: Action[]): Promise<Action[]> {
  return Promise.all(actions.map(action => {
    var resource_id = (action.action_id > 0) ? action.action_id : '';
    return fetch(`${metry_host}/actions/${resource_id}`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(action),
    })
    .then(res => res.json())
    .then(raiseAction)
    .then((syncedAction: Action) => {
      // if it was a temporary action, delete the temporary one
      let deletes = (action.action_id < 0) ? [{action_id: action.action_id, deleted: new Date()}] : [];
      return [...deletes, syncedAction];
    });
  }))
  .then((actionss: Array<Action[]>) => {
    return actionss.reduce((actions: Action[], newAction: Action) => actions.concat(newAction), []);
  });
}

/**
Simpler than syncActions since we don't handle unsynced actiontypes.
*/
function syncActiontypes(actiontypes: Actiontype[]): Promise<Actiontype[]> {
  return Promise.all(actiontypes.map(actiontype => {
    return fetch(`${metry_host}/actiontypes/${actiontype.actiontype_id || ''}`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(actiontype),
    })
    .then(res => res.json());
  }));
}

@connect(({actions, actiontypes, now, configuration}) => ({actions, actiontypes, now, configuration}))
export default class MetricsTable extends React.Component {
  componentDidMount() {
    let {start, end} = this.props;
    Promise.all([fetchActions({start, end}), fetchActiontypes()])
    .then(([actions, actiontypes]) => {
      this.props.dispatch({type: OperationType.ADD_ACTIONS, actions});
      this.props.dispatch({type: OperationType.ADD_ACTIONTYPES, actiontypes});
    })
    .catch(reason => console.error('fetchActions(types) error', reason));
  }
  syncActions(...actions) {
    // sync local actions
    this.props.dispatch({type: OperationType.ADD_ACTIONS, actions});
    // we may not get an immediate rerender of the grayed-out local action
    // without this async closure (apparently it will group the http request
    // and redraw into the same frame event, and wait to repaint until the http
    // response comes back). setImmediate seems to have the same effect, timing
    // wise, as requestAnimationFrame.
    setImmediate(() => {
      syncActions(actions)
      .then(actions => {
        this.props.dispatch({type: OperationType.ADD_ACTIONS, actions});
        this.props.dispatch({type: OperationType.SET_NOW, date: new Date()});
      })
      .catch(reason => console.error('syncActions error', reason));
    });
  }
  onAddAction(actiontype_id, started_moment, ended_moment) {
    this.syncActions({
      actiontype_id,
      action_id: -randInt(),
      started: started_moment.toDate(),
      ended: ended_moment.toDate(),
      local: true,
    });
  }
  onDeleteAction(action_id, event) {
    event.stopPropagation();
    // create delete action
    this.syncActions({action_id, deleted: new Date(), local: true});
  }
  onAddActiontype(event) {
    // stop form submit
    event.preventDefault();
    // get input name
    var input = this.refs.actiontypeName;
    var name = input.value;
    var actiontypes = [{name}];
    syncActiontypes(actiontypes)
    .then(actiontypes => {
      this.props.dispatch({type: OperationType.ADD_ACTIONTYPES, actiontypes});
      input.value = '';
    })
    .catch(reason => console.error('syncActiontypes error', reason));
  }
  render() {
    const {start, end, actions, actiontypes, now, configuration} = this.props;
    const actions_hashmap = groupBy(actions, action => action.actiontype_id);
    const columns = createRange(start, end, moment.duration(1, 'day'))
    .map(range_moment => {
      return {
        start: range_moment,
        middle: range_moment.clone().add(12, 'hour'),
        end: range_moment.clone().add(1, 'day'),
      };
    });
    // filter down to only the actions within this timeframe
    // nvm, fetchActions should only retrieve the relevant ones
    // var actions = this.props.actions.filter(action =>
    //   start.isBefore(action.started) && end.isAfter(action.ended));
    // and group them by actiontype_id
    var highlighted_moment = moment(now);
    var trs = actiontypes.filter(actiontype => {
      if (configuration.excludeEmpty) {
        return (actions_hashmap[actiontype.actiontype_id] || []).length > 0;
      }
      return true;
    }).sort((actiontype1, actiontype2) => {
      if (configuration.sortAlphabetically) {
        return actiontype1.name.localeCompare(actiontype2.name);
      }
      return actiontype1.entered.localeCompare(actiontype2.entered);
    }).map(actiontype => {
      var actiontype_actions = actions_hashmap[actiontype.actiontype_id] || [];
      var tds = columns.map(column => {
        var actions = actiontype_actions.filter(action =>
          column.start.isBefore(action.started) && column.end.isAfter(action.ended));
        // the contents should default to non-empty in case there are no actions
        var spans = '\xA0'; // A0 is &nbsp; in hex
        // apparently sometimes webpack's UglifyJS step breaks on \xA0 ?
        if (actions.length) {
          spans = actions.map(action => {
            return <span key={action.action_id} className={action.local ? 'local' : ''}
              onMouseDown={this.onDeleteAction.bind(this, action.action_id)}>I</span>;
          });
        }
        var highlighted = highlighted_moment.isBetween(column.start, column.end);
        var td_key = column.middle.toISOString();
        // if the column is highlighted (is today), use the actual current time
        // FIXME: is there a better way to handle this with store state?
        var started_moment = highlighted ? moment() : column.middle;
        var ended_moment = started_moment;
        return (
          <td key={td_key} className={highlighted ? 'highlighted' : ''}>
            <div className="cell" onMouseDown={this.onAddAction.bind(this,
                actiontype.actiontype_id, started_moment, ended_moment)}>
              {spans}
            </div>
          </td>
        );
      });
      return (
        <tr key={actiontype.actiontype_id}>
          <td>{actiontype.name}</td>
          {tds}
        </tr>
      );
    });
    return (
      <table>
        <thead>
          <tr>
            <th>Dates:</th>
            {columns.map(column => {
              var label = column.start.format('M/D');
              var day = column.start.format('ddd');
              var highlighted = highlighted_moment.isBetween(column.start, column.end);
              return <th key={label} className={highlighted ? 'highlighted' : ''}><div>{label}</div>{day}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {trs}
        </tbody>
        <tfoot>
          <tr>
            <td>
              <form onSubmit={this.onAddActiontype.bind(this)} className="vpad">
                <input type="text" ref="actiontypeName" placeholder="New action type" />
              </form>
            </td>
          </tr>
        </tfoot>
      </table>
    );
  }
  static propTypes = {
    start: React.PropTypes.object.isRequired, // moment.Moment
    end: React.PropTypes.object.isRequired, // moment.Moment
  }
}
