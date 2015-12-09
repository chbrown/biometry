import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider, connect} from 'react-redux';

import store from './store';
import {OperationType} from './operations';
import MetricsTable from './components/MetricsTable';
import RecentActions from './components/RecentActions';

import './site.less';

@connect(state => ({now: state.now}))
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visibility: 'visible',
    };
  }
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

ReactDOM.render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('app'));
