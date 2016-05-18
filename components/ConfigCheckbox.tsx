import * as React from 'react';
import {connect} from 'react-redux';
import {bind, OperationType, Configuration, ConnectProps} from '../types';

interface ConfigCheckboxProps {
  label: string;
  name: string;
  configuration?: Configuration;
}

@connect(state => ({configuration: state.configuration}))
class ConfigCheckbox extends React.Component<ConfigCheckboxProps & ConnectProps, any> {
  @bind
  onChange(ev: React.FormEvent) {
    const input = ev.target as HTMLInputElement;
    const configuration = {[this.props.name]: input.checked};
    this.props.dispatch({type: OperationType.SET_CONFIGURATION, configuration});
  }
  render() {
    const {label, name, configuration} = this.props;
    const value = configuration[name];
    return (
      <label>
        <input type="checkbox" checked={value} onChange={this.onChange} />
        <b>{label}</b>
      </label>
    );
  }
}

export default ConfigCheckbox;
