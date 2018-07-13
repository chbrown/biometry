import * as React from 'react'
import {connect} from 'react-redux'
import bind from '@chbrown/bind'
import {OperationType, Configuration, GlobalState, ConnectProps} from '../types'

export interface ConfigCheckboxProps {
  configuration: Configuration
  label: string
  name: string
}

class ConfigCheckbox extends React.Component<ConfigCheckboxProps & ConnectProps> {
  @bind
  onChange(ev: React.FormEvent<HTMLInputElement>) {
    const input = ev.currentTarget
    const configuration = {[this.props.name]: input.checked}
    this.props.dispatch({type: OperationType.SET_CONFIGURATION, configuration})
  }
  render() {
    const {label, name, configuration} = this.props
    const value = configuration[name]
    return (
      <label id={name}>
        <input type="checkbox" checked={value} onChange={this.onChange} />
        <b>{label}</b>
      </label>
    )
  }
}

const mapStateToProps = ({configuration}: GlobalState) => ({configuration})
const ConnectedConfigCheckbox = connect(mapStateToProps)(ConfigCheckbox)

export default ConnectedConfigCheckbox
