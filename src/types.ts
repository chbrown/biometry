import {DispatchProp} from 'react-redux'

export const metry_host = 'https://metry.test'

export type PropsWhere<T, PT> = {
  [P in keyof T]: T[P] extends PT ? P : never
}

/**
From T derive a subtype with properties P[] where T[P] extends KT

Inspired by https://medium.com/dailyjs/typescript-create-a-condition-based-subset-types-9d902cea5b8c
*/
export type PickWhere<T, PT> = Pick<T, PropsWhere<T, PT>[keyof T]>

/**
Action will have a random temporary ID called tmp_id until it is synced with the
remote database, after which it will receive a unique ID, which overrides the tmp_id.

The idea is that we want to be able to manage Actions on the client-side even
before they're synced, but not have the server worry about these temporary IDs.
*/
export interface Action {
  action_id: number
  actiontype_id?: number
  started?: Date // string
  ended?: Date // string
  deleted?: Date // string
  entered?: Date // string
  /**
  `local` (= unsynced) is false when the Action's `action_id` comes from the
  database's sequence, not the local randomly-generated one.
  */
  local?: boolean
}

export interface ActionJSON {
  action_id: number
  actiontype_id?: number
  started?: string
  ended?: string
  deleted?: string
  entered?: string
}

export interface Actiontype {
  actiontype_id?: number
  name: string
  view_order?: number
  archived?: boolean
  created?: string // string repr of Date
  entered?: string // string repr of Date
}

export interface Configuration {
  daysPast?: number
  sortAlphabetically?: boolean
  excludeEmpty?: boolean
}

export const OperationType = {
  ADD_ACTIONS: 'ADD_ACTIONS',
  ADD_ACTIONTYPES: 'ADD_ACTIONTYPES',
  SET_NOW: 'SET_NOW',
  SET_CONFIGURATION: 'SET_CONFIGURATION',
}

export interface GlobalState {
  actions: Action[]
  actiontypes: Actiontype[]
  now: Date
  configuration: Configuration
}

export interface Operation {
  type: string
  actions?: Action[]
  actiontypes?: Actiontype[]
  date?: Date
  configuration?: Configuration
}

export type ConnectProps = DispatchProp<Operation>

export function raiseAction(action: ActionJSON): Action {
  // TODO: is it faster to raise it in-place?
  return {
    action_id: action.action_id,
    actiontype_id: action.actiontype_id,
    started: action.started ? new Date(action.started) : null,
    ended: action.ended ? new Date(action.ended) : null,
    entered: action.entered ? new Date(action.entered) : null,
    deleted: action.deleted ? new Date(action.deleted) : null,
  }
}
