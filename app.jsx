import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider, connect} from 'react-redux';
import {Route, IndexRoute} from 'react-router';
import {ReduxRouter} from 'redux-router';

import store from './store';
import {OperationType} from './operations';
import MetricsTable from './components/MetricsTable';
import RecentActions from './components/RecentActions';

// uh, this is a weird way to add styles, but okay
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
        this.props.dispatch({
          type: OperationType.SET_NOW,
          date: new Date(),
        });
      }
    });
  }
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

class Actions extends React.Component {
  render() {
    var query = this.props.location.query;
    var end = query.end ? moment(query.end, 'YYYY-MM-DD') : moment().endOf('day');
    var start = query.start ? moment(query.start, 'YYYY-MM-DD') : end.clone().startOf('month');
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

class NotFound extends React.Component {
  render() {
    return <h1 className="hpad">Oh noes, route not found: {this.props.routeParams.splat}</h1>;
  }
}

ReactDOM.render((
  <Provider store={store}>
    <ReduxRouter>
      <Route path="/" component={App}>
        <IndexRoute component={Actions} />
        <Route path="*" component={NotFound} />
      </Route>
    </ReduxRouter>
  </Provider>
), document.getElementById('app'));
