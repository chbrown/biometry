import {OperationType, Operation, Action, Actiontype, Configuration} from './types';

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

export function actions(actions: Action[] = [], operation: Operation) {
  switch (operation.type) {
  case OperationType.ADD_ACTIONS:
    return operation.actions.reduce(concatAction, actions);
  default:
    return actions;
  }
}

export function actiontypes(actiontypes: Actiontype[] = [], operation: Operation) {
  switch (operation.type) {
  case OperationType.ADD_ACTIONTYPES:
    return actiontypes.concat(operation.actiontypes);
  default:
    return actiontypes;
  }
}

export function now(now: Date = new Date(), operation: Operation) {
  switch (operation.type) {
  case OperationType.SET_NOW:
    return operation.date;
  default:
    return now;
  }
}

const defaultConfiguration = {
  daysPast: parseInt(localStorage['daysPast'] || '14', 10),
  sortAlphabetically: localStorage['sortAlphabetically'] === 'true',
  excludeEmpty: localStorage['excludeEmpty'] === 'true',
};
export function configuration(configuration: Configuration = defaultConfiguration, operation: Operation) {
  switch (operation.type) {
  case OperationType.SET_CONFIGURATION:
    const newConfiguration = Object.assign({}, configuration, operation.configuration);
    Object.assign(localStorage, newConfiguration);
    return newConfiguration;
  default:
    return configuration;
  }
}
