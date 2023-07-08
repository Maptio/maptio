import { createAction, props } from '@ngrx/store';

export const setCurrentOrganisationId = createAction(
  '[Global] Set Current Organisation ID',
  props<{ currentOrganisationId: string }>()
);
