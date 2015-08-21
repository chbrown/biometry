/*jslint esnext: true */
import React from 'react';
import MetricsTable from './components/MetricsTable';
import Router, {Route, DefaultRoute, NotFoundRoute, RouteHandler} from 'react-router';
import {fetchAll, store, OperationType} from './store';
import {Provider, connect} from 'react-redux';

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
    // console.log('Actions#props', this.props);
    // console.log('Actions#context.router params', this.context.router.getCurrentParams());
    var start = new Date(this.props.query.start || '2015-08-01');
    var end = new Date(this.props.query.end || '2015-08-30');
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
