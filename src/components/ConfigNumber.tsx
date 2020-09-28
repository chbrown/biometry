import * as React from 'react'
import {connect} from 'react-redux'
import {PickWhere, OperationType, Configuration, GlobalState, ConnectProps} from '../types'

export interface ConfigNumberProps {
  configuration: Configuration
  name: keyof PickWhere<Configuration, number>
  label?: string
}

const ConfigNumber = (props: ConfigNumberProps & ConnectProps) => {
  const {label, name, configuration} = props
  const onChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const input = ev.target as HTMLInputElement
    const configuration = {[name]: parseInt(input.value, 10)}
    props.dispatch({type: OperationType.SET_CONFIGURATION, configuration})
  }
  const value = configuration[name]
  return (
    <label id={name}>
      <div><b>{label || name}</b></div>
      <input type="number" value={value} onChange={onChange} />
    </label>
  )
}

const mapStateToProps = ({configuration}: GlobalState) => ({configuration})
const ConnectedConfigNumber = connect(mapStateToProps)(ConfigNumber)

export default ConnectedConfigNumber
