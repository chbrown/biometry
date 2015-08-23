/// <reference path="type_declarations/index.d.ts" />
import {Action, Actiontype} from './store';

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
