import * as React from 'react';
import * as moment from 'moment';
import {connect} from 'react-redux';
import {Action, Actiontype, GlobalState} from '../types';

const ActionRow = ({action, actiontype, now, format = 'YYYY-MM-DD h:mma'}) => {
  const instantaneous = (action.started - action.ended) === 0;
  const ago = moment(action.entered).from(now);
  return (
    <tr>
      <td className="right">[<i title="entered">{ago}</i>]</td>
      <td className="left padded"><b>{actiontype ? actiontype.name : '(not found)'}</b></td>
      <td className="left">
        {instantaneous ?
          <span title="started/ended">{moment(action.started).format(format)}</span> :
          <span>
            <span title="started">{moment(action.started).format(format)}</span>
            -
            <span title="ended">{moment(action.ended).format(format)}</span>
          </span>
        }
      </td>
    </tr>
  );
};

interface RecentActionsProps {
  actions: Action[];
  actiontypes: Actiontype[];
  now: Date;
  limit: number;
}

class RecentActions extends React.Component<RecentActionsProps> {
  render() {
    const {actions, actiontypes, now, limit = 20} = this.props;
    return (
      <table>
        {actions.slice(-limit).reverse().map(action =>
          <ActionRow key={action.action_id} action={action} now={now}
            actiontype={actiontypes.find(actiontype => actiontype.actiontype_id == action.actiontype_id)} />
        )}
      </table>
    );
  }
}

const mapStateToProps = ({actions, actiontypes, now}: GlobalState) => ({actions, actiontypes, now});
const ConnectedRecentActions = connect(mapStateToProps)(RecentActions);

export default ConnectedRecentActions;
