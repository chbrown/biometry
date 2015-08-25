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
    var end = this.props.query.end ? moment(this.props.query.end, 'YYYY-MM-DD') : moment().startOf('day');
    var start = this.props.query.start ? moment(this.props.query.start, 'YYYY-MM-DD') : end.clone().startOf('month');
    return (
      <section className="hpad">
        <MetricsTable start={start} end={end} />
      </section>
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