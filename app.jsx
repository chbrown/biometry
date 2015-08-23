/*jslint esnext: true */
import moment from 'moment';
import React from 'react';
import {Provider, connect} from 'react-redux';
import Router, {Route, DefaultRoute, NotFoundRoute, RouteHandler} from 'react-router';

import MetricsTable from './components/MetricsTable';
import {fetchAll, store, OperationType} from './store';

// uh, this is a weird way to add styles, but okay
import './site.less';

export class App extends React.Component {
  render() {
    return (
      <main>
        <RouteHandler />
      </main>
    );
  }
}

class Actions extends React.Component {
  render() {
    var start = moment(this.props.query.start || '2015-08-01', 'YYYY-MM-DD');
    var end = moment(this.props.query.end || '2015-08-30', 'YYYY-MM-DD');
    return (
      <MetricsTable start={start} end={end} />
    );
  }
}
// Actions.contextTypes = {
//   router: React.PropTypes.func
// };

class NotFound extends React.Component {
  render() {
    return <h1>Oh noes, route not found!</h1>;
  }
}

var routes = (
  <Route path="/" handler={App}>
    <DefaultRoute handler={Actions} />
    <Route name="actions" handler={Actions} />
    <NotFoundRoute handler={NotFound} />
  </Route>
);
// Router.run(routes, Router.HistoryLocation, (Handler, state) => {
Router.run(routes, (Handler, routerState) => {
  // routerState.params
  var mount = document.getElementById('app');
  React.render(<Provider store={store}>{() => <Handler routerState={routerState} />}</Provider>, mount);
});
