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
            .sendJSON(action, function (error, synced_action) {
            if (error)
                return callback(error);
            var result_actions = [];
            // if it was a temporary action, delete the temporary one
            if (action.action_id < 0) {
                return callback(null, [{ action_id: action.action_id, deleted: new Date() }, synced_action]);
            }
            callback(null, [action]);
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
function fetchActions(callback) {
    new httprequest_1.Request('GET', metry_host + '/actions').send(callback);
}
exports.fetchActions = fetchActions;
function fetchActiontypes(callback) {
    new httprequest_1.Request('GET', metry_host + '/actiontypes').send(callback);
}
exports.fetchActiontypes = fetchActiontypes;
