import moment from 'moment';
import React from 'react';
import {connect} from 'react-redux';
import {fetchActions, fetchActiontypes, syncActions, syncActiontypes} from '../api';
import {OperationType} from '../operations';

/**
Return a mixture of day-granularity timestamp (meaning, it will repeat from
one day to the next) and randomness, but still considerably smaller than the
maximum safe integer. It will be positive.
// const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
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

/**
props {
  start: moment.Moment;
  end: moment.Moment;
}
*/
@connect(state => ({actions: state.actions, actiontypes: state.actiontypes, now: state.now}))
export default class MetricsTable extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    fetchActions((error, actions) => {
      if (error) return console.error('fetchActions error', error);
      this.props.dispatch({type: OperationType.ADD_ACTIONS, actions});
    });
    fetchActiontypes((error, actiontypes) => {
      if (error) return console.error('fetchActiontypes error', error);
      this.props.dispatch({type: OperationType.ADD_ACTIONTYPES, actiontypes});
    });
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
      syncActions(actions, (error, actions) => {
        if (error) return console.error('syncActions error', error);
        this.props.dispatch({type: OperationType.ADD_ACTIONS, actions});
        var date = new Date();
        this.props.dispatch({type: OperationType.SET_NOW, date});
      });
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
    syncActiontypes(actiontypes, (error, actiontypes) => {
      if (error) return console.error('syncActiontypes error', error);
      this.props.dispatch({type: OperationType.ADD_ACTIONTYPES, actiontypes});
      input.value = '';
    });
  }
  render() {
    var range_moments = createRange(this.props.start, this.props.end, moment.duration(1, 'day'));
    // filter down to only the actions within this timeframe
    var actions = this.props.actions.filter(action =>
      this.props.start.isBefore(action.started) && this.props.end.isAfter(action.ended));
    // and group them by actiontype_id
    var actions_hashmap = groupBy(actions, action => action.actiontype_id);
    var columns = range_moments.map(range_moment => {
      return {
        start: range_moment,
        middle: range_moment.clone().add(12, 'hour'),
        end: range_moment.clone().add(1, 'day'),
      };
    });
    var highlighted_moment = moment(this.props.now);
    var ths = columns.map(column => {
      var label = column.start.format('M/D');
      var highlighted = highlighted_moment.isBetween(column.start, column.end);
      var thClassName = highlighted ? 'highlighted' : '';
      return <th key={label} className={thClassName}>{label}</th>;
    });
    var trs = this.props.actiontypes.map(actiontype => {
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
        var tdClassName = highlighted ? 'highlighted' : '';
        var td_key = column.middle.toISOString();
        // if the column is highlighted (is today), use the actual current time
        // FIXME: is there a better way to handle this with store state?
        var started_moment = highlighted ? moment() : column.middle;
        var ended_moment = started_moment;
        return (
          <td key={td_key} className={tdClassName}>
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
          <tr><th>Dates:</th>{ths}</tr>
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
}
