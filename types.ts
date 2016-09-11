export const metry_host = 'https://metry.dev';

export interface ConnectProps {
  dispatch?(operation: Operation): any;
}

export const bind: MethodDecorator = <T extends Function>(target: Object,
                                                          propertyKey: string | symbol,
                                                          descriptor: TypedPropertyDescriptor<T>) => {
  return {
    configurable: true,
    get() {
      const value = descriptor.value.bind(this);
      Object.defineProperty(this, propertyKey, {
        value,
        configurable: true,
        writable: true
      });
      return value;
    }
  };
};

/**
Action will have a random temporary ID called tmp_id until it is synced with the
remote database, after which it will receive a unique ID, which overrides the tmp_id.

The idea is that we want to be able to manage Actions on the client-side even
before they're synced, but not have the server worry about these temporary IDs.
*/
export interface Action {
  action_id: number;
  actiontype_id?: number;
  started?: Date; // string
  ended?: Date; // string
  deleted?: Date; // string
  entered?: Date; // string
  /**
  `local` (= unsynced) is false when the Action's `action_id` comes from the
  database's sequence, not the local randomly-generated one.
  */
  local?: boolean;
}

export interface ActionJSON {
  action_id: number;
  actiontype_id?: number;
  started?: string;
  ended?: string;
  deleted?: string;
  entered?: string;
}

export interface Actiontype {
  actiontype_id?: number;
  name: string;
  view_order?: number;
  archived?: boolean;
  created?: string; // string repr of Date
  entered?: string; // string repr of Date
}

export interface Configuration {
  daysPast?: number;
  sortAlphabetically?: boolean;
  excludeEmpty?: boolean;
}

export const OperationType = {
  ADD_ACTIONS: 'ADD_ACTIONS',
  ADD_ACTIONTYPES: 'ADD_ACTIONTYPES',
  SET_NOW: 'SET_NOW',
  SET_CONFIGURATION: 'SET_CONFIGURATION',
};

export interface GlobalState {
  actions: Action[];
  actiontypes: Actiontype[];
  now: Date;
  configuration: Configuration;
}

export interface Operation {
  type: string;
  actions?: Action[];
  actiontypes?: Actiontype[];
  date?: Date;
  configuration?: Configuration;
}

export function raiseAction(action: ActionJSON): Action {
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
