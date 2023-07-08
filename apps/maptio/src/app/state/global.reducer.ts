import { createReducer, on, Action } from '@ngrx/store';

import * as GlobalActions from './global.actions';

export const GLOBAL_FEATURE_KEY = 'global';

export interface GlobalState {
  currentOrganisationId?: string;
}

export interface GlobalPartialState {
  readonly [GLOBAL_FEATURE_KEY]: GlobalState;
}

export const initialGlobalState: GlobalState = {
  currentOrganisationId: undefined,
};

const reducer = createReducer(
  initialGlobalState,
  on(
    GlobalActions.setCurrentOrganisationId,
    (state, action): GlobalState => ({
      ...state,
      currentOrganisationId: action.currentOrganisationId,
    })
  )
);

export function globalReducer(state: GlobalState | undefined, action: Action) {
  return reducer(state, action);
}
