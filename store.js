/// <reference path="type_declarations/index.d.ts" />
var redux_1 = require('redux');
var operations_1 = require('./operations');
/**
Cull duplicate actions, retaining only the latest. Interpret deletes.

Assumes that `actions` is already deduplicated and does not contain deletes.

Does not mutate `actions`.
*/
function concatAction(actions, new_action) {
    // remove any existing actions that have the same action_id
    var filtered_actions = actions.filter(function (action) { return action.action_id !== new_action.action_id; });
    // deleted might be null if it comes from the database, or undefined if from the app
    if (!new_action.deleted) {
        filtered_actions.push(new_action);
    }
    return filtered_actions;
}
function actionsReducer(actions, operation) {
    if (actions === void 0) { actions = []; }
    switch (operation.type) {
        case operations_1.OperationType.ADD_ACTIONS:
            return operation.actions.reduce(concatAction, actions);
        default:
            return actions;
    }
}
function actiontypesReducer(actiontypes, operation) {
    if (actiontypes === void 0) { actiontypes = []; }
    switch (operation.type) {
        case operations_1.OperationType.ADD_ACTIONTYPES:
            return actiontypes.concat(operation.actiontypes);
        default:
            return actiontypes;
    }
}
function nowReducer(now, operation) {
    if (now === void 0) { now = new Date(); }
    switch (operation.type) {
        case operations_1.OperationType.SET_NOW:
            return operation.date;
        default:
            return now;
    }
}
var reducer = redux_1.combineReducers({
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
var loggerMiddleware = function (store) { return function (next) { return function (operation) {
    console.group(operation.type);
    console.info('dispatching', operation);
    var result = next(operation);
    console.log('next state', store.getState());
    console.groupEnd();
    return result;
}; }; };
var thunkMiddleware = function (store) { return function (next) { return function (operation) {
    // pass along non-function operations without modification
    if (typeof operation !== 'function') {
        return next(operation);
    }
    // otherwise call the function like so:
    return operation(store.dispatch, store.getState);
}; }; };
// let createStoreWithMiddleware = applyMiddleware(loggerMiddleware, thunkMiddleware)(createStore);
// let createStoreWithMiddleware = applyMiddleware(thunkMiddleware)(createStore);
exports.store = redux_1.createStore(reducer);
