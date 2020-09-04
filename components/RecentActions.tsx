import * as React from 'react'
import * as moment from 'moment'
import {connect} from 'react-redux'
import {Action, Actiontype, GlobalState} from '../types'

interface ActionRowProps {
  action: Action
  actiontype: Actiontype
  now: Date
  format?: string
}

const ActionRow = ({action, actiontype, now, format = 'YYYY-MM-DD h:mma'}: ActionRowProps) => {
  const instantaneous = (action.started.getTime() - action.ended.getTime()) === 0
  const ago = moment(action.entered).from(now)
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
  )
}

interface RecentActionsProps {
  actions: Action[]
  actiontypes: Actiontype[]
  now: Date
  limit?: number
}

const RecentActions = ({actions, actiontypes, now, limit = 20}: RecentActionsProps) => (
  <table>
    <tbody>
      {actions.slice(-limit).reverse().map(action =>
        <ActionRow key={action.action_id} action={action} now={now}
          actiontype={actiontypes.find(actiontype => actiontype.actiontype_id == action.actiontype_id)} />
      )}
    </tbody>
  </table>
)

const mapStateToProps = ({actions, actiontypes, now}: GlobalState) => ({actions, actiontypes, now})
const ConnectedRecentActions = connect(mapStateToProps)(RecentActions)

export default ConnectedRecentActions
