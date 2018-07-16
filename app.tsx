import * as React from 'react'
import {render} from 'react-dom'
import {combineReducers, createStore} from 'redux'
import {Provider} from 'react-redux'

import * as reducers from './reducers'
import {OperationType} from './types'
import App from './components/App'

import './site.less'

const reducer = combineReducers(reducers)
const store = createStore(reducer)

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
    <App />
  </Provider>
), document.getElementById('app'))
