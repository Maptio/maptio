import { createSelector } from '@ngrx/store';

import { AppState } from './app.state';

export const selectCurrentOrganisationId = createSelector(
  (state: AppState) => state.currentOrganisationId,
  (currentOrganisationId: string) => currentOrganisationId
);

