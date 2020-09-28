import * as React from 'react'
import {render} from 'react-dom'
import {createHashHistory} from 'history'
import {applyMiddleware, combineReducers, compose, createStore} from 'redux'
import {Provider} from 'react-redux'
import {Route, Switch} from 'react-router'
import {connectRouter, routerMiddleware, ConnectedRouter} from 'connected-react-router'

import * as reducers from './reducers'
import {OperationType} from './types'
import App from './components/App'

import './site.less'

const createReducer = (history) => combineReducers({router: connectRouter(history), ...reducers})
const history = createHashHistory()
const store = createStore(
  createReducer(history),
  compose(
    applyMiddleware(
      routerMiddleware(history)
    )
  )
)

document.addEventListener('visibilitychange', () => {
  /**
  See https://www.w3.org/TR/page-visibility/

  document.visibilityState will be either 'hidden' or 'visible'
  */
  if (!document.hidden) { // same as document.visibilityState === 'visible' ?
    const date = new Date()
    store.dispatch({type: OperationType.SET_NOW, date})
  }
})

render((
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route component={App} />
      </Switch>
    </ConnectedRouter>
  </Provider>
), document.getElementById('app'))
