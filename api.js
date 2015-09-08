/// <reference path="type_declarations/index.d.ts" />
var async = require('async');
var httprequest_1 = require('httprequest');
var metry_host = 'https://metry';
function flatten(arrays) {
    return Array.prototype.concat.apply([], arrays);
}
function syncActions(actions, callback) {
    async.map(actions, function (action, callback) {
        var resource_id = (action.action_id > 0) ? action.action_id : '';
        new httprequest_1.Request('POST', metry_host + '/actions/' + resource_id)
            .sendJSON(action, function (error, synced_action_json) {
            if (error)
                return callback(error);
            var synced_action = raiseAction(synced_action_json);
            // if it was a temporary action, delete the temporary one
            var deletes = (action.action_id < 0) ? [{ action_id: action.action_id, deleted: new Date() }] : [];
            //
            callback(null, deletes.concat([synced_action]));
        });
    }, function (error, actionss) {
        if (error)
            return callback(error);
        var actions = flatten(actionss);
        callback(null, actions);
    });
}
exports.syncActions = syncActions;
/**
Simpler than syncActions since we don't handle unsynced actiontypes.
*/
function syncActiontypes(actiontypes, callback) {
    async.map(actiontypes, function (actiontype, callback) {
        new httprequest_1.Request('POST', metry_host + '/actiontypes/' + (actiontype.actiontype_id || ''))
            .sendJSON(actiontype, callback);
    }, callback);
}
exports.syncActiontypes = syncActiontypes;
function raiseAction(action) {
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
function fetchActions(callback) {
    new httprequest_1.Request('GET', metry_host + '/actions').send(function (error, actions_json) {
        if (error)
            return callback(error);
        var actions = actions_json.map(raiseAction);
        callback(null, actions);
    });
}
exports.fetchActions = fetchActions;
function fetchActiontypes(callback) {
    new httprequest_1.Request('GET', metry_host + '/actiontypes').send(callback);
}
exports.fetchActiontypes = fetchActiontypes;
