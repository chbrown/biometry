/// <reference path="type_declarations/index.d.ts" />
import {combineReducers, createStore, applyMiddleware} from 'redux';
import * as moment from 'moment';

import {OperationType, Operation} from './operations';

/**
Action will have a random temporary ID called tmp_id until it is synced with the
remote database, after which it will receive a unique ID, which overrides the tmp_id.

The idea is that we want to be able to manage Actions on the client-side even
before they're synced, but not have the server worry about these temporary IDs.
*/
export interface Action {
  action_id: number;
  actiontype_id?: number;
  started?: Date; // string
  ended?: Date; // string
  deleted?: Date; // string
  entered?: Date; // string
  /**
  `local` (= unsynced) is false when the Action's `action_id` comes from the
  database's sequence, not the local randomly-generated one.
  */
  local?: boolean;
}
export interface ActionJSON {
  action_id: number;
  actiontype_id?: number;
  started?: string;
  ended?: string;
  deleted?: string;
  entered?: string;
}

export interface Actiontype {
  actiontype_id: number;
  name: string;
  view_order: number;
  archived: boolean;
  created: Date; // string
}

/**
Cull duplicate actions, retaining only the latest. Interpret deletes.

Assumes that `actions` is already deduplicated and does not contain deletes.

Does not mutate `actions`.
*/
function concatAction(actions: Action[], new_action: Action) {
  // remove any existing actions that have the same action_id
  var filtered_actions = actions.filter(action => action.action_id !== new_action.action_id);
  // deleted might be null if it comes from the database, or undefined if from the app
  if (!new_action.deleted) {
    filtered_actions.push(new_action);
  }
  return filtered_actions;
}

function actionsReducer(actions: Action[] = [], operation: Operation) {
  switch (operation.type) {
  case OperationType.ADD_ACTIONS:
    return operation.actions.reduce(concatAction, actions);
  default:
    return actions;
  }
}

function actiontypesReducer(actiontypes: Actiontype[] = [], operation: Operation) {
  switch (operation.type) {
  case OperationType.ADD_ACTIONTYPES:
    return actiontypes.concat(operation.actiontypes);
  default:
    return actiontypes;
  }
}

function nowReducer(now: Date = new Date(), operation: Operation) {
  switch (operation.type) {
  case OperationType.SET_NOW:
    return operation.date;
  default:
    return now;
  }
}

let reducer = combineReducers({
  actions: actionsReducer,
  actiontypes: actiontypesReducer,
  now: nowReducer,
});
// same as:
// let reducer = function(state, operation) {
//   return {
//     actions: actionsReducer(state.actions, operation),
//     actiontypes: actiontypesReducer(state.actiontypes, operation),
//     ...
//   };
// }

const loggerMiddleware = store => next => operation => {
  console.group(operation.type);
  console.info('dispatching', operation);
  let result = next(operation);
  console.log('next state', store.getState());
  console.groupEnd();
  return result;
};
const thunkMiddleware = store => next => operation => {
  // pass along non-function operations without modification
  if (typeof operation !== 'function') {
    return next(operation);
  }
  // otherwise call the function like so:
  return operation(store.dispatch, store.getState);
};
// let createStoreWithMiddleware = applyMiddleware(loggerMiddleware, thunkMiddleware)(createStore);
// let createStoreWithMiddleware = applyMiddleware(thunkMiddleware)(createStore);
export let store = createStore(reducer);
