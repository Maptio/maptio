import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on, Action } from '@ngrx/store';

import * as GlobalActions from './global.actions';
import { GlobalEntity } from './global.models';

export const GLOBAL_FEATURE_KEY = 'global';

export interface GlobalState extends EntityState<GlobalEntity> {
  selectedId?: string | number; // which Global record has been selected
  loaded: boolean; // has the Global list been loaded
  error?: string | null; // last known error (if any)
}

export interface GlobalPartialState {
  readonly [GLOBAL_FEATURE_KEY]: GlobalState;
}

export const globalAdapter: EntityAdapter<GlobalEntity> =
  createEntityAdapter<GlobalEntity>();

export const initialGlobalState: GlobalState = globalAdapter.getInitialState({
  // set initial required properties
  loaded: false,
});

const reducer = createReducer(
  initialGlobalState,
  on(GlobalActions.initGlobal, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(GlobalActions.loadGlobalSuccess, (state, { global }) =>
    globalAdapter.setAll(global, { ...state, loaded: true })
  ),
  on(GlobalActions.loadGlobalFailure, (state, { error }) => ({
    ...state,
    error,
  }))
);

export function globalReducer(state: GlobalState | undefined, action: Action) {
  return reducer(state, action);
}
