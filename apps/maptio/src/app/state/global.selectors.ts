import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  GLOBAL_FEATURE_KEY,
  GlobalState,
  globalAdapter,
} from './global.reducer';

// Lookup the 'Global' feature state managed by NgRx
export const selectGlobalState =
  createFeatureSelector<GlobalState>(GLOBAL_FEATURE_KEY);

const { selectAll, selectEntities } = globalAdapter.getSelectors();

export const selectGlobalLoaded = createSelector(
  selectGlobalState,
  (state: GlobalState) => state.loaded
);

export const selectGlobalError = createSelector(
  selectGlobalState,
  (state: GlobalState) => state.error
);

export const selectAllGlobal = createSelector(
  selectGlobalState,
  (state: GlobalState) => selectAll(state)
);

export const selectGlobalEntities = createSelector(
  selectGlobalState,
  (state: GlobalState) => selectEntities(state)
);

export const selectSelectedId = createSelector(
  selectGlobalState,
  (state: GlobalState) => state.selectedId
);

export const selectEntity = createSelector(
  selectGlobalEntities,
  selectSelectedId,
  (entities, selectedId) => (selectedId ? entities[selectedId] : undefined)
);
