import { Action } from '@ngrx/store';

import * as WorkspaceActions from './workspace.actions';
import { WorkspaceEntity } from './workspace.models';
import {
  WorkspaceState,
  initialWorkspaceState,
  workspaceReducer,
} from './workspace.reducer';

describe('Workspace Reducer', () => {
  const createWorkspaceEntity = (id: string, name = ''): WorkspaceEntity => ({
    id,
    name: name || `name-${id}`,
  });

  describe('valid Workspace actions', () => {
    it('loadWorkspaceSuccess should return the list of known Workspace', () => {
      const workspace = [
        createWorkspaceEntity('PRODUCT-AAA'),
        createWorkspaceEntity('PRODUCT-zzz'),
      ];
      const action = WorkspaceActions.loadWorkspaceSuccess({ workspace });

      const result: WorkspaceState = workspaceReducer(
        initialWorkspaceState,
        action
      );

      expect(result.loaded).toBe(true);
      expect(result.ids.length).toBe(2);
    });
  });

  describe('unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as Action;

      const result = workspaceReducer(initialWorkspaceState, action);

      expect(result).toBe(initialWorkspaceState);
    });
  });
});
