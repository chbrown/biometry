import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {combineReducers, createStore} from 'redux';
import * as reducers from './reducers';

import App from './components/App';

import './site.less';

const reducer = combineReducers(reducers);
const store = createStore(reducer);

ReactDOM.render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('app'));
