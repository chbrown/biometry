import moment from 'moment';
import React from 'react';
import {connect} from 'react-redux';

@connect(state => ({actions: state.actions, actiontypes: state.actiontypes, now: state.now}))
export default class RecentActions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      format: 'YYYY-MM-DD h:mma',
      limit: props.limit || 20,
    };
  }
  render() {
    var actions = this.props.actions.slice(-this.state.limit).reverse();
    var action_divs = actions.map(action => {
      var actiontype = this.props.actiontypes.filter(actiontype => actiontype.actiontype_id == action.actiontype_id)[0];
      var duration = (action.started - action.ended) === 0
        ? moment(action.started).format(this.state.format)
        : `${moment(action.started).format(this.state.format)}-${moment(action.ended).format(this.state.format)}`;

      // I kinda don't like having the current date creep in; it should be in
      // the state, but you get weird things like "in a few seconds" when
      // adding a new action.
      var ago = moment(action.entered).from(this.props.now);
      return (
        <div key={action.action_id}>
          [<i>{ago}</i>] <b>{actiontype ? actiontype.name : '(not found)'}</b>: {duration}
        </div>
      );
    });
    return <div>{action_divs}</div>;
  }
}
