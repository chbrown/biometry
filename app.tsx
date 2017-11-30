import * as moment from 'moment';
import * as React from 'react';
import {render} from 'react-dom';
import {combineReducers, createStore} from 'redux';
import {Provider, connect} from 'react-redux';

import MetricsTable from './components/MetricsTable';
import RecentActions from './components/RecentActions';
import ConfigNumber from './components/ConfigNumber';
import ConfigCheckbox from './components/ConfigCheckbox';

import * as reducers from './reducers';
import {OperationType, Configuration, GlobalState} from './types';

import './site.less';

const buildTimestamp = __WEBPACK_TIMESTAMP__;

const reducer = combineReducers(reducers as any);
const store = createStore(reducer);

document.addEventListener('visibilitychange', () => {
  /**
  See https://www.w3.org/TR/page-visibility/

  document.visibilityState will be either 'hidden' or 'visible'
  */
  if (!document.hidden) { // same as document.visibilityState === 'visible' ?
    var date = new Date();
    store.dispatch({type: OperationType.SET_NOW, date});
  }
});

interface AppProps {
  configuration: Configuration;
  now: Date;
}

class App extends React.Component<AppProps, {}> {
  render() {
    const {configuration, now} = this.props;
    const {daysPast} = configuration;
    const end = moment().endOf('day');
    const start = end.clone().subtract(daysPast, 'd');
    return (
      <main>
        <div className="flex">
          <h2>Biometry App</h2>
          <div>
            <ConfigNumber label="Days Past" name="daysPast" />
            <ConfigCheckbox label="Sort Alphabetically" name="sortAlphabetically" />
            <ConfigCheckbox label="Exclude Empty" name="excludeEmpty" />
          </div>
        </div>
        <section>
          <MetricsTable start={start} end={end} />
        </section>
        <section>
          <h3>Recent Additions</h3>
          <RecentActions limit={20} />
        </section>
        <footer>
          <div className="now-timestamp">{now.toISOString()}</div>
          <div className="build-timestamp">{buildTimestamp}</div>
        </footer>
      </main>
    );
  }
}

const mapStateToProps = ({configuration, now}: GlobalState) => ({configuration, now});
const ConnectedApp = connect(mapStateToProps)(App);

render((
  <Provider store={store}>
    <ConnectedApp />
  </Provider>
), document.getElementById('app'));
