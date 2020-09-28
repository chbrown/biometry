import * as React from 'react'
import {connect} from 'react-redux'
import {PickWhere, OperationType, Configuration, GlobalState, ConnectProps} from '../types'

export interface ConfigCheckboxProps {
  configuration: Configuration
  name: keyof PickWhere<Configuration, boolean>
  label?: string
}

const ConfigCheckbox = (props: ConfigCheckboxProps & ConnectProps) => {
  const {label, name, configuration} = props
  const onChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const input = ev.currentTarget
    const configuration = {[name]: input.checked}
    props.dispatch({type: OperationType.SET_CONFIGURATION, configuration})
  }
  const value = configuration[name]
  return (
    <label id={name}>
      <input type="checkbox" checked={value} onChange={onChange} />
      <b>{label || name}</b>
    </label>
  )
}

const mapStateToProps = ({configuration}: GlobalState) => ({configuration})
const ConnectedConfigCheckbox = connect(mapStateToProps)(ConfigCheckbox)

export default ConnectedConfigCheckbox
