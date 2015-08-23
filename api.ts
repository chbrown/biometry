/// <reference path="type_declarations/index.d.ts" />
import * as async from 'async';
import {Request} from 'httprequest';
import {Action, Actiontype} from './store';

const metry_host = 'https://metry';

function flatten<T>(arrays: T[][]): T[] {
  return Array.prototype.concat.apply([], arrays);
}

export function syncActions(actions: Action[], callback: (error: Error, actions?: Action[]) => void) {
  async.map(actions, (action, callback: any) => {
    var resource_id = (action.action_id > 0) ? action.action_id : '';
    new Request('POST', metry_host + '/actions/' + resource_id)
    .sendJSON(action, (error: Error, synced_action: Action) => {
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

/**
Simpler than syncActions since we don't handle unsynced actiontypes.
*/
export function syncActiontypes(actiontypes: Actiontype[], callback: (error: Error, actiontypes?: Actiontype[]) => void) {
  async.map(actiontypes, (actiontype, callback: any) => {
    new Request('POST', metry_host + '/actiontypes/' + (actiontype.actiontype_id || ''))
    .sendJSON(actiontype, callback);
  }, callback);
}

export function fetchActions(callback: (error: Error, actions?: Action[]) => void) {
  new Request('GET', metry_host + '/actions').send(callback);
}

export function fetchActiontypes(callback: (error: Error, actiontypes?: Actiontype[]) => void) {
  new Request('GET', metry_host + '/actiontypes').send(callback);
}
