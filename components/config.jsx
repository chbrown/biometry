import React from 'react';
import {connect} from 'react-redux';
import {bind, OperationType} from '../types';

@connect(state => ({configuration: state.configuration}))
export class ConfigNumber extends React.Component {
  @bind
  onChange(ev) {
    const configuration = {[this.props.name]: parseInt(ev.target.value, 10)};
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

@connect(state => ({configuration: state.configuration}))
export class ConfigCheckbox extends React.Component {
  @bind
  onChange(ev) {
    const configuration = {[this.props.name]: ev.target.checked};
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
