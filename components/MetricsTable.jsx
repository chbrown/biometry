import moment from 'moment';
import React from 'react';
import {connect} from 'react-redux';
import {metry_host, bind, OperationType, Action, ActionJSON, raiseAction, Actiontype} from '../types';

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
  const hash = {};
  xs.forEach(x => {
    const key = keyFn(x);
    let list = hash[key];
    if (list === undefined) {
      list = hash[key] = [];
    }
    list.push(x);
  });
  return hash;
}

function createRange(start: moment.Moment, end: moment.Moment, duration: moment.Duration): moment.Moment[] {
  const range: moment.Moment[] = [];
  const cursor = start.clone();
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
    const resource_id = (action.action_id > 0) ? action.action_id : '';
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

function dispatchSyncActions(dispatch, ...actions) {
  // sync local actions
  dispatch({type: OperationType.ADD_ACTIONS, actions});
  // we may not get an immediate rerender of the grayed-out local action
  // without this async closure (apparently it will group the http request
  // and redraw into the same frame event, and wait to repaint until the http
  // response comes back). setImmediate seems to have the same effect, timing
  // wise, as requestAnimationFrame.
  setImmediate(() => {
    syncActions(actions)
    .then(actions => {
      dispatch({type: OperationType.ADD_ACTIONS, actions});
      dispatch({type: OperationType.SET_NOW, date: new Date()});
    })
    .catch(reason => console.error('syncActions error', reason));
  });
}

@connect()
class ActionSpan extends React.Component {
  @bind
  onDelete(ev) {
    ev.stopPropagation();
    // create delete action
    dispatchSyncActions(this.props.dispatch, {
      action_id: this.props.action_id,
      deleted: new Date(),
      local: true,
    });
  }
  render() {
    return (
      <span className={this.props.local ? 'local' : ''} onMouseDown={this.onDelete}>I</span>
    );
  }
  static propTypes = {
    action_id: React.PropTypes.number.isRequired,
    local: React.PropTypes.bool,
    dispatch: React.PropTypes.func.isRequired, // redux store dispatcher
  }
}

@connect()
class ActiontypeCell extends React.Component {
  @bind
  onAdd() {
    const {instant, actiontype_id} = this.props;
    console.log('ActiontypeCell dispatch', {
      actiontype_id,
      action_id: -randInt(),
      started: instant.toDate(),
      ended: instant.toDate(),
      local: true,
    });
    dispatchSyncActions(this.props.dispatch, {
      actiontype_id,
      action_id: -randInt(),
      started: instant.toDate(),
      ended: instant.toDate(),
      local: true,
    });
  }
  render() {
    const {actions, className} = this.props;
    return (
      <td className={className}>
        <div className="cell" onMouseDown={this.onAdd}>
          {(actions.length > 0) ? actions.map(action =>
            <ActionSpan key={action.action_id} action_id={action.action_id} local={action.local} />
          ) : '\xA0'}
        </div>
      </td>
    );
  }
  static propTypes = {
    actiontype_id: React.PropTypes.number.isRequired,
    actions: React.PropTypes.array.isRequired,
    className: React.PropTypes.string,
    dispatch: React.PropTypes.func.isRequired, // redux store dispatcher
    instant: React.PropTypes.object.isRequired, // moment.Moment
  }
}

class ActiontypeRow extends React.Component {
  render() {
    const {actiontype, actions, highlighted_moment, columns} = this.props;
    // the contents should default to non-empty in case there are no actions,
    // thus, \xA0, which is &nbsp; in hex
    const cells = columns.map(({start, middle, end}) => {
      const cellActions = actions.filter(action =>
        start.isBefore(action.started) && end.isAfter(action.ended));
      // apparently sometimes webpack's UglifyJS step breaks on \xA0 ?
      const highlighted = highlighted_moment.isBetween(start, end);
      const instant = highlighted ? highlighted_moment : middle;
      // if the column is highlighted (is today), use the actual current time
      return {key: middle.toISOString(), actions: cellActions, highlighted, instant};
    });
    const latest = Math.max(...actions.map(action => action.ended));
    return (
      <tr>
        <td className="right padded">{actiontype.name}</td>
        {cells.map(({key, actions, highlighted, instant}) =>
          <ActiontypeCell key={key} className={highlighted ? 'highlighted' : ''}
            actiontype_id={actiontype.actiontype_id} actions={actions} instant={instant} />
        )}
        <td className="left padded">{actiontype.name}</td>
        <td className="left"><i>{moment(latest).from(highlighted_moment)}</i></td>
      </tr>
    );
  }
  static propTypes = {
    actiontype: React.PropTypes.object.isRequired,
    actions: React.PropTypes.array.isRequired,
    highlighted_moment: React.PropTypes.object.isRequired, // moment.Moment
    columns: React.PropTypes.arrayOf(React.PropTypes.shape({
      start: React.PropTypes.object.isRequired, // moment.Moment
      middle: React.PropTypes.object.isRequired, // moment.Moment
      end: React.PropTypes.object.isRequired, // moment.Moment
    })).isRequired,
  }
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
  @bind
  onAddActiontype(event) {
    // stop form submit
    event.preventDefault();
    // get input name
    const input = this.refs.actiontypeName;
    const name = input.value;
    const actiontypes = [{name}];
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
    // const actions = this.props.actions.filter(action =>
    //   start.isBefore(action.started) && end.isAfter(action.ended));
    // and group them by actiontype_id
    const highlighted_moment = moment(now);
    const actiontypesWithActions = actiontypes.filter(actiontype => {
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
      const actiontypeActions = actions_hashmap[actiontype.actiontype_id] || [];
      return {actiontype, actions: actiontypeActions};
    });
    return (
      <table>
        <thead>
          <tr>
            <th className="right padded">Dates:</th>
            {columns.map(column => {
              const label = column.middle.format('M/D');
              const day = column.middle.format('ddd');
              const highlighted = highlighted_moment.isBetween(column.start, column.end);
              return (
                <th key={label} className={highlighted ? 'highlighted' : ''}>
                  <div>{label}</div>{day}
                </th>
              );
            })}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {actiontypesWithActions.map(({actiontype, actions}) =>
            <ActiontypeRow key={actiontype.actiontype_id}
              actiontype={actiontype} actions={actions}
              highlighted_moment={highlighted_moment} columns={columns} />
          )}
        </tbody>
        <tfoot>
          <tr>
            <td>
              <form onSubmit={this.onAddActiontype} className="vpad">
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
