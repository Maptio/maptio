import { createReducer, on } from '@ngrx/store';

import { setCurrentOrganisationId } from './current-organisation.actions';

export const currentOrganisationFeatureKey = 'currentOrganisation';

export interface State {
  currentOrganisationId: string;
}

export const initialState = undefined;

export const currentOrganisationIdReducer = createReducer(
  initialState,
  on(
    setCurrentOrganisationId,
    (state, action): State => ({
      ...state,
      currentOrganisationId: action.currentOrganisationId,
    })
  )
);

