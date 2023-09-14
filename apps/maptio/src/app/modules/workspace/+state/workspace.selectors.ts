import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  WORKSPACE_FEATURE_KEY,
  WorkspaceState,
  // workspaceAdapter,
} from './workspace.reducer';

// Lookup the 'Workspace' feature state managed by NgRx
export const selectWorkspaceState = createFeatureSelector<WorkspaceState>(
  WORKSPACE_FEATURE_KEY
);

// const { selectAll, selectEntities } = workspaceAdapter.getSelectors();

// export const selectWorkspaceLoaded = createSelector(
//   selectWorkspaceState,
//   (state: WorkspaceState) => state.loaded
// );

// export const selectWorkspaceError = createSelector(
//   selectWorkspaceState,
//   (state: WorkspaceState) => state.error
// );

// export const selectAllWorkspace = createSelector(
//   selectWorkspaceState,
//   (state: WorkspaceState) => selectAll(state)
// );

// export const selectWorkspaceEntities = createSelector(
//   selectWorkspaceState,
//   (state: WorkspaceState) => selectEntities(state)
// );

export const selectSelectedInitiativeID = createSelector(
  selectWorkspaceState,
  (state: WorkspaceState) => state.selectedInitiativeID
);

// export const selectEntity = createSelector(
//   selectWorkspaceEntities,
//   selectSelectedInitiativeID,
//   (entities, selectedId) => (selectedId ? entities[selectedId] : undefined)
// );
