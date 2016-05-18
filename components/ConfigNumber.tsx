import * as React from 'react';
import {connect} from 'react-redux';
import {bind, OperationType, Configuration, ConnectProps} from '../types';

interface ConfigNumberProps {
  label: string;
  name: string;
  configuration?: Configuration;
}

@connect(state => ({configuration: state.configuration}))
class ConfigNumber extends React.Component<ConfigNumberProps & ConnectProps, {}> {
  @bind
  onChange(ev: React.FormEvent) {
    const input = ev.target as HTMLInputElement;
    const configuration = {[this.props.name]: parseInt(input.value, 10)};
    this.props.dispatch({type: OperationType.SET_CONFIGURATION, configuration});
  }
  render() {
    const {label, name, configuration} = this.props;
    const value = configuration[name];
    return (
      <label>
        <div><b>{label}</b></div>
        <input type="number" value={value} onChange={this.onChange} />
      </label>
    );
  }
}

export default ConfigNumber;
