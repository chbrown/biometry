/// <reference path="type_declarations/index.d.ts" />
import {Action, Actiontype} from './store';

export const OperationType = {
  ADD_ACTIONS: 'ADD_ACTIONS',
  ADD_ACTIONTYPES: 'ADD_ACTIONTYPES',
  SET_NOW: 'SET_NOW',
};
export interface Operation {
  type: string;
  actions?: Action[];
  actiontypes?: Actiontype[];
  date?: Date;
}
