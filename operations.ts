/// <reference path="type_declarations/index.d.ts" />
import * as async from 'async';
import {Request} from 'httprequest';

import {Action, Actiontype} from './store';

const metry_host = 'https://metry';

function flatten<T>(arrays: T[][]): T[] {
  return Array.prototype.concat.apply([], arrays);
}

function syncActions(actions: Action[], callback: (error: Error, actions?: Action[]) => void) {
  async.map(actions, (action, callback: any) => {
    var resource_id = (action.action_id > 0) ? action.action_id : '';
    new Request('POST', metry_host + '/actions/' + resource_id).sendJSON(action, (error: Error, synced_action: Action) => {
      if (error) return callback(error);

      var result_actions = [];
      // if it was a temporary action, delete the temporary one
      if (action.action_id < 0) {
        return callback(null, [{action_id: action.action_id, deleted: new Date()}, synced_action]);
      }
      callback(null, [action]);
    });
  }, (error, actionss: Action[][]) => {
    if (error) return callback(error);
    var actions = flatten(actionss);
    callback(null, actions);
  });
}

export function fetchAll(callback: (error: Error, actions?: Action[], actiontypes?: Actiontype[]) => void) {
  async.parallel<any>({
    actions: callback => new Request('GET', metry_host + '/actions').send(callback),
    actiontypes: callback => new Request('GET', metry_host + '/actiontypes').send(callback),
  }, (error, {actions, actiontypes}) => {
    if (error) return callback(error);
    callback(null, actions, actiontypes);
  });
}

// operation creators

export const OperationType = {
  ADD_ACTIONS: 'ADD_ACTIONS',
  ADD_ACTIONTYPES: 'ADD_ACTIONTYPES',
};
export interface Operation {
  type: string;
  actions?: Action[];
  actiontypes?: Actiontype[];
}
export interface AsyncOperation {
  (dispatch: (operation: Operation | Function) => any, getState: Function): any;
}

export function SyncActions(actions: Action[]): AsyncOperation {
  return (dispatch: (operation: Operation | Function) => any, getState: Function) => {
    // trigger sync of any local actions
    var local_actions = actions.filter(action => action.local);
    // we may not get an immediate rerender of the grayed-out local action
    // without this async closure (apparently it will group the http request
    // and redraw into the same frame event, and wait to repaint until the http
    // response comes back). setImmediate seems to have the same effect, timing
    // wise, as requestAnimationFrame.
    setImmediate(() => {
      syncActions(local_actions, (error: Error, actions: Action[]) => {
        if (error) return console.error('syncActions error', error);
        dispatch(AddActions(actions));
      });
    });
    dispatch(AddActions(actions));
  };
}

export function AddActions(actions: Action[]): Operation {
  return {
    type: OperationType.ADD_ACTIONS,
    actions: actions,
  };
}
export function AddActiontypes(actiontypes: Actiontype[]): Operation {
  return {
    type: OperationType.ADD_ACTIONTYPES,
    actiontypes: actiontypes,
  }
}

export function FetchAll() {
  return (dispatch: (operation: Operation | Function) => any, getState: Function) => {
    fetchAll((error, actions, actiontypes) => {
      if (error) return console.error('fetchAll error', error);
      dispatch(AddActions(actions));
      dispatch(AddActiontypes(actiontypes));
    });
  };
}
