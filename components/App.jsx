import React from 'react';
import moment from 'moment';
import {connect} from 'react-redux';

import MetricsTable from './MetricsTable';
import RecentActions from './RecentActions';
import {OperationType} from '../types';

@connect(state => ({now: state.now}))
export default class App extends React.Component {
  componentDidMount() {
    document.addEventListener('visibilitychange', () => {
      /** document.visibilityState will be either 'hidden' or 'visible' */
      if (document.visibilityState === 'visible') {
        var date = new Date();
        this.props.dispatch({type: OperationType.SET_NOW, date});
      }
    });
  }
  render() {
    var end = moment().endOf('day');
    var start = null;
    if (start === null) {
      start = end.clone().startOf('month');
      // push back start a little more if it's too short
      if (end.diff(start, 'd') < 14) {
        start.subtract(14, 'd');
      }
    }
    return (
      <main>
        <section className="hpad">
          <MetricsTable start={start} end={end} />
        </section>
        <section className="hpad">
          <h3>Recent Additions</h3>
          <RecentActions limit={10} />
        </section>
      </main>
    );
  }
}
