import { createReducer, on } from '@ngrx/store';

import { GlobalState } from './app.state';
import { setCurrentOrganisationId } from './current-organisation.actions';

export const initialState: GlobalState = { currentOrganisationId: undefined };

export const currentOrganisationIdReducer = createReducer<GlobalState>(
  initialState,
  on(
    setCurrentOrganisationId,
    (state, action): GlobalState => ({
      ...state,
      currentOrganisationId: action.currentOrganisationId,
    })
  )
);
