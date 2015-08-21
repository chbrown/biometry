/*jslint esnext: true */
import React from 'react';
import moment from 'moment';
import {bindActionCreators as bindOperationCreators} from 'redux';
import {connect} from 'react-redux';
import {SyncActions, FetchAll} from '../operations';

/**
Return a mixture of day-granularity timestamp (meaning, it will repeat from
one day to the next) and randomness, but still considerably smaller than the
maximum safe integer. It will be positive.
// const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
*/
function randInt() {
  return (new Date() % 10000000) * 1000 + (Math.random() * 1000 | 0);
}

function createRange(start: Date, end: Date, duration: moment.Duration): moment.Moment[] {
  var range: moment.Moment[] = [];
  var cursor = moment.utc(start);
  do {
    range.push(cursor.clone());
    cursor.add(duration);
  } while (cursor.isBefore(end));
  return range;
}


/**
store props {
  actions: Action[];
  actiontypes: Actiontype[];
  start: Date;
  end: Date;
}
*/

@connect(
  state => ({actions: state.actions, actiontypes: state.actiontypes}),
  // the second argument, with bindOperationCreators, adds the given functions to this.props,
  // and automatically maps calls to those functions over to the store via dispatch()
  // bindOperationCreators is just a way to abstract the store away from
  // components that don't need/want to know about it.
  dispatch => bindOperationCreators({SyncActions, FetchAll}, dispatch)
)
export default class MetricsTable extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.props.FetchAll();
  }
  onAdd(actiontype_id, column_moment) {
    this.props.SyncActions([{
      actiontype_id,
      action_id: -randInt(),
      started: column_moment.toDate(),
      ended: column_moment.toDate(),
      local: true,
    }]);
  }
  onDelete(action_id, event) {
    event.stopPropagation();
    // create delete action
    this.props.SyncActions([{
      action_id,
      deleted: new Date(),
      local: true,
    }]);
  }
  render() {
    var range_moments = createRange(this.props.start, this.props.end, moment.duration(1, 'day'));
    var columns = range_moments.map(range_moment => {
      return {
        start: range_moment,
        middle: range_moment.clone().add(12, 'hour'),
        end: range_moment.clone().add(1, 'day'),
      }
    });
    var ths = columns.map(column => {
      var label = column.middle.format('M/D');
      return <th key={label}>{label}</th>;
    });
    var trs = this.props.actiontypes.map(actiontype => {
      var actiontype_actions = this.props.actions.filter(action => action.actiontype_id == actiontype.actiontype_id);
      var tds = columns.map(column => {
        var actions = actiontype_actions.filter(action =>
          column.start.isBefore(action.started) && column.end.isAfter(action.ended));
        // the contents should default to non-empty in case there are no actions
        var spans = '\xA0'; // A0 is &nbsp; in hex
        if (actions.length) {
          spans = actions.map(action => {
            return <span key={action.action_id} className={action.local ? 'local' : ''}
              onMouseDown={this.onDelete.bind(this, action.action_id)}>I</span>;
          });
        }
        var td_key = column.middle.toISOString();
        return (
          <td key={td_key}>
            <div className="cell" onMouseDown={this.onAdd.bind(this, actiontype.actiontype_id, column.middle)}>
              {spans}
            </div>
          </td>
        );
      });
      return <tr key={actiontype.actiontype_id}><td>{actiontype.name}</td>{tds}</tr>;
    });
    return (
      <table>
        <thead>
          <tr><th>Dates:</th>{ths}</tr>
        </thead>
        <tbody>
          {trs}
        </tbody>
      </table>
    );
  }
}
