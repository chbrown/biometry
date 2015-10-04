/*jslint esnext: true */
import moment from 'moment';
import React from 'react';
import {Provider, connect} from 'react-redux';
import Router, {Route, DefaultRoute, NotFoundRoute, RouteHandler} from 'react-router';

import MetricsTable from './components/MetricsTable';
import {fetchAll, store} from './store';
import {OperationType} from './operations';

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
    window.OperationType = OperationType;
    // console.log('Adding document.visibilitychange event listener in App component');
    document.addEventListener('visibilitychange', (ev) => {
      /** document.visibilityState will be either 'hidden' or 'visible' */
      // console.log('visibilitychange', ev, document.visibilityState);
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
      <RouteHandler />
    );
  }
}

@connect(state => ({actions: state.actions, actiontypes: state.actiontypes, now: state.now}))
class RecentActions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      format: 'YYYY-MM-DD h:mma',
      limit: props.limit || 20,
    };
  }
  render() {
    var actions = this.props.actions.slice(-this.state.limit).reverse();
    var action_divs = actions.map(action => {
      var actiontype = this.props.actiontypes.filter(actiontype => actiontype.actiontype_id == action.actiontype_id)[0];
      var duration = (action.started - action.ended) === 0
        ? moment(action.started).format(this.state.format)
        : `${moment(action.started).format(this.state.format)}-${moment(action.ended).format(this.state.format)}`;

      // I kinda don't like having the current date creep in; it should be in
      // the state, but you get weird things like "in a few seconds" when
      // adding a new action.
      var ago = moment(action.entered).from(this.props.now);
      return (
        <div key={action.action_id}>
          [<i>{ago}</i>] <b>{actiontype ? actiontype.name : '(not found)'}</b>: {duration}
        </div>
      );
    });
    return <div>{action_divs}</div>;
  }
}


class Actions extends React.Component {
  render() {
    var end = this.props.query.end ? moment(this.props.query.end, 'YYYY-MM-DD') : moment().endOf('day');
    var start = this.props.query.start ? moment(this.props.query.start, 'YYYY-MM-DD') : end.clone().startOf('month');
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

// Actions.contextTypes = {
//   router: React.PropTypes.func
// };

class NotFound extends React.Component {
  render() {
    return <h1 className="hpad">Oh noes, route not found!</h1>;
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
