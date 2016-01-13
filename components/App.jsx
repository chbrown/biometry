import React from 'react';
import moment from 'moment';
import {connect} from 'react-redux';

import MetricsTable from './MetricsTable';
import RecentActions from './RecentActions';
import {ConfigNumber, ConfigCheckbox} from './config';

@connect(state => ({configuration: state.configuration}))
export default class App extends React.Component {
  render() {
    const {daysPast} = this.props.configuration;
    var end = moment().endOf('day');
    var start = end.clone().subtract(daysPast, 'd');
    return (
      <main>
        <div className="hpad vpad flex">
          <h2>Biometry App</h2>
          <div>
            <ConfigNumber label="Days Past" name="daysPast" />
            <ConfigCheckbox label="Sort Alphabetically" name="sortAlphabetically" />
            <ConfigCheckbox label="Exclude Empty" name="excludeEmpty" />
          </div>
        </div>
        <section className="hpad">
          <MetricsTable start={start} end={end} />
        </section>
        <section className="hpad">
          <h3 className="vpad">Recent Additions</h3>
          <RecentActions limit={10} />
        </section>
      </main>
    );
  }
}
