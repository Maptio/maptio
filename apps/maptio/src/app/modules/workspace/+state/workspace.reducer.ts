import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on, Action } from '@ngrx/store';

import * as WorkspaceActions from './workspace.actions';
import { WorkspaceEntity } from './workspace.models';
// import { set } from 'lodash';

export const WORKSPACE_FEATURE_KEY = 'workspace';

export interface WorkspaceState {
  selectedInitiativeID: number;
}

export interface WorkspacePartialState {
  readonly [WORKSPACE_FEATURE_KEY]: WorkspaceState;
}

export const workspaceAdapter: EntityAdapter<WorkspaceEntity> =
  createEntityAdapter<WorkspaceEntity>();

export const initialWorkspaceState: WorkspaceState = {
  selectedInitiativeID: undefined,
};

const reducer = createReducer(
  initialWorkspaceState,
  on(
    WorkspaceActions.setSelectedInitiativeID,
    (state, { selectedInitiativeID }) => ({
      ...state,
      selectedInitiativeID,
    })
  )
  // on(WorkspaceActions.initWorkspace, (state) => ({
  //   ...state,
  //   loaded: false,
  //   error: null,
  // })),
  // on(WorkspaceActions.loadWorkspaceSuccess, (state, { workspace }) =>
  //   workspaceAdapter.setAll(workspace, { ...state, loaded: true })
  // ),
  // on(WorkspaceActions.loadWorkspaceFailure, (state, { error }) => ({
  //   ...state,
  //   error,
  // }))
);

export function workspaceReducer(
  state: WorkspaceState | undefined,
  action: Action
) {
  return reducer(state, action);
}
