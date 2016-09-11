import * as moment from 'moment';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {combineReducers, createStore} from 'redux';
import {Provider, connect} from 'react-redux';

import MetricsTable from './components/MetricsTable';
import RecentActions from './components/RecentActions';
import ConfigNumber from './components/ConfigNumber';
import ConfigCheckbox from './components/ConfigCheckbox';

import * as reducers from './reducers';
import {OperationType, Configuration, GlobalState} from './types';

import './site.less';

const reducer = combineReducers(reducers);
const store = createStore(reducer);

document.addEventListener('visibilitychange', () => {
  /** document.visibilityState will be either 'hidden' or 'visible' */
  if (document.visibilityState === 'visible') {
    var date = new Date();
    store.dispatch({type: OperationType.SET_NOW, date});
  }
});

interface AppProps {
  configuration?: Configuration;
  now?: Date;
}

@connect((state: GlobalState) => ({configuration: state.configuration, now: state.now}))
class App extends React.Component<AppProps, {}> {
  render() {
    const {configuration, now} = this.props;
    const {daysPast} = configuration;
    const end = moment().endOf('day');
    const start = end.clone().subtract(daysPast, 'd');
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

ReactDOM.render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('app'));