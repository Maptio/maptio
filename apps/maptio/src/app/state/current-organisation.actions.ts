import { createAction, props } from '@ngrx/store';

export const setCurrentOrganisationId = createAction(
  '[Current Organisation ID] Set',
  props<{ currentOrganisationId: string }>()
);

export const setCurrentOrganisation = createAction(
  '[Current Organisation] Set'
);

