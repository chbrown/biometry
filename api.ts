import * as async from 'async';
import {Request} from 'httprequest';
import {Action, ActionJSON, Actiontype} from './store';

const metry_host = 'https://metry';

function flatten<T>(arrays: T[][]): T[] {
  return Array.prototype.concat.apply([], arrays);
}

export function syncActions(actions: Action[], callback: (error: Error, actions?: Action[]) => void) {
  async.map(actions, (action, callback: any) => {
    var resource_id = (action.action_id > 0) ? action.action_id : '';
    new Request('POST', metry_host + '/actions/' + resource_id)
    .sendJSON(action, (error: Error, synced_action_json: ActionJSON) => {
      if (error) return callback(error);

      var synced_action = raiseAction(synced_action_json);
      // if it was a temporary action, delete the temporary one
      var deletes = (action.action_id < 0) ? [{action_id: action.action_id, deleted: new Date()}] : [];

      //
      callback(null, [...deletes, synced_action]);
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

function raiseAction(action: ActionJSON): Action {
  // TODO: is it faster to raise it in-place?
  return {
    action_id: action.action_id,
    actiontype_id: action.actiontype_id,
    started: action.started ? new Date(action.started) : null,
    ended: action.ended ? new Date(action.ended) : null,
    entered: action.entered ? new Date(action.entered) : null,
    deleted: action.deleted ? new Date(action.deleted) : null,
  };
}

export function fetchActions(callback: (error: Error, actions?: Action[]) => void) {
  new Request('GET', metry_host + '/actions').send((error, actions_json: ActionJSON[]) => {
    if (error) return callback(error);
    var actions = actions_json.map(raiseAction);
    callback(null, actions);
  });
}

export function fetchActiontypes(callback: (error: Error, actiontypes?: Actiontype[]) => void) {
  new Request('GET', metry_host + '/actiontypes').send(callback);
}
