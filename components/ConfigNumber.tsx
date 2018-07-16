import * as React from 'react'
import {connect} from 'react-redux'
import bind from '@chbrown/bind'
import {PickWhere, OperationType, Configuration, GlobalState, ConnectProps} from '../types'

export interface ConfigNumberProps {
  configuration: Configuration
  name: keyof PickWhere<Configuration, number>
  label?: string
}

class ConfigNumber extends React.Component<ConfigNumberProps & ConnectProps> {
  @bind
  onChange(ev: React.FormEvent<HTMLInputElement>) {
    const input = ev.target as HTMLInputElement
    const configuration = {[this.props.name]: parseInt(input.value, 10)}
    this.props.dispatch({type: OperationType.SET_CONFIGURATION, configuration})
  }
  render() {
    const {label, name, configuration} = this.props
    const value = configuration[name]
    return (
      <label id={name}>
        <div><b>{label || name}</b></div>
        <input type="number" value={value} onChange={this.onChange} />
      </label>
    )
  }
}

const mapStateToProps = ({configuration}: GlobalState) => ({configuration})
const ConnectedConfigNumber = connect(mapStateToProps)(ConfigNumber)

export default ConnectedConfigNumber
