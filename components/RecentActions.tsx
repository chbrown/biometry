import * as React from 'react';
import * as moment from 'moment';
import {connect} from 'react-redux';
import {Action, Actiontype, GlobalState} from '../types';

const ActionItem = ({action, actiontype, now, format = 'YYYY-MM-DD h:mma'}) => {
  const instantaneous = (action.started - action.ended) === 0;
  const ago = moment(action.entered).from(now);
  return (
    <div>
      [<i title="entered">{ago}</i>]{' '}
      <b>{actiontype ? actiontype.name : '(not found)'}</b>{': '}
      {instantaneous ?
        <span title="started/ended">{moment(action.started).format(format)}</span> :
        <span>
          <span title="started">{moment(action.started).format(format)}</span>
          -
          <span title="ended">{moment(action.ended).format(format)}</span>
        </span>
      }
    </div>
  );
};

interface RecentActionsProps {
  actions?: Action[];
  actiontypes?: Actiontype[];
  now?: Date;
  limit: number;
}

@connect((state: GlobalState) => ({actions: state.actions, actiontypes: state.actiontypes, now: state.now}))
class RecentActions extends React.Component<RecentActionsProps, {}> {
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

export default RecentActions;
