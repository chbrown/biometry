import moment from 'moment';
import React from 'react';
import {connect} from 'react-redux';

const ActionItem = ({action, actiontype, now, format = 'YYYY-MM-DD h:mma'}) => {
  var duration = (action.started - action.ended) === 0
    ? moment(action.started).format(format)
    : `${moment(action.started).format(format)}-${moment(action.ended).format(format)}`;

  var ago = moment(action.entered).from(now);
  return <div>[<i>{ago}</i>] <b>{actiontype ? actiontype.name : '(not found)'}</b>: {duration}</div>;
};

@connect(state => ({actions: state.actions, actiontypes: state.actiontypes, now: state.now}))
export default class RecentActions extends React.Component {
  render() {
    const {actions, actiontypes, now, limit = 20} = this.props;
    return (
      <div>
        {actions.slice(-limit).reverse().map(action =>
          <ActionItem key={action.action_id} action={action} now={now}
            actiontype={actiontypes.find(actiontype => actiontype.actiontype_id == action.actiontype_id)} />
        )}
      </div>
    );
  }
}
