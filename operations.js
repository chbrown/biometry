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
        new httprequest_1.Request('POST', metry_host + '/actions/' + resource_id).sendJSON(action, function (error, synced_action) {
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
function fetchAll(callback) {
    async.parallel({
        actions: function (callback) { return new httprequest_1.Request('GET', metry_host + '/actions').send(callback); },
        actiontypes: function (callback) { return new httprequest_1.Request('GET', metry_host + '/actiontypes').send(callback); },
    }, function (error, _a) {
        var actions = _a.actions, actiontypes = _a.actiontypes;
        if (error)
            return callback(error);
        callback(null, actions, actiontypes);
    });
}
exports.fetchAll = fetchAll;
// operation creators
exports.OperationType = {
    ADD_ACTIONS: 'ADD_ACTIONS',
    ADD_ACTIONTYPES: 'ADD_ACTIONTYPES',
};
function SyncActions(actions) {
    return function (dispatch, getState) {
        // trigger sync of any local actions
        var local_actions = actions.filter(function (action) { return action.local; });
        // we may not get an immediate rerender of the grayed-out local action
        // without this async closure (apparently it will group the http request
        // and redraw into the same frame event, and wait to repaint until the http
        // response comes back). setImmediate seems to have the same effect, timing
        // wise, as requestAnimationFrame.
        setImmediate(function () {
            syncActions(local_actions, function (error, actions) {
                if (error)
                    return console.error('syncActions error', error);
                dispatch(AddActions(actions));
            });
        });
        dispatch(AddActions(actions));
    };
}
exports.SyncActions = SyncActions;
function AddActions(actions) {
    return {
        type: exports.OperationType.ADD_ACTIONS,
        actions: actions,
    };
}
exports.AddActions = AddActions;
function AddActiontypes(actiontypes) {
    return {
        type: exports.OperationType.ADD_ACTIONTYPES,
        actiontypes: actiontypes,
    };
}
exports.AddActiontypes = AddActiontypes;
function FetchAll() {
    return function (dispatch, getState) {
        fetchAll(function (error, actions, actiontypes) {
            if (error)
                return console.error('fetchAll error', error);
            dispatch(AddActions(actions));
            dispatch(AddActiontypes(actiontypes));
        });
    };
}
exports.FetchAll = FetchAll;
