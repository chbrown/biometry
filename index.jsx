import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';

import * as reducers from './reducers';
import {OperationType} from './types';

import App from './components/App';

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

ReactDOM.render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('app'));
