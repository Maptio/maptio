import { WorkspaceEntity } from './workspace.models';
import {
  workspaceAdapter,
  WorkspacePartialState,
  initialWorkspaceState,
} from './workspace.reducer';
import * as WorkspaceSelectors from './workspace.selectors';

describe('Workspace Selectors', () => {
  const ERROR_MSG = 'No Error Available';
  const getWorkspaceId = (it: WorkspaceEntity) => it.id;
  const createWorkspaceEntity = (id: string, name = '') =>
    ({
      id,
      name: name || `name-${id}`,
    } as WorkspaceEntity);

  let state: WorkspacePartialState;

  beforeEach(() => {
    state = {
      workspace: workspaceAdapter.setAll(
        [
          createWorkspaceEntity('PRODUCT-AAA'),
          createWorkspaceEntity('PRODUCT-BBB'),
          createWorkspaceEntity('PRODUCT-CCC'),
        ],
        {
          ...initialWorkspaceState,
          selectedId: 'PRODUCT-BBB',
          error: ERROR_MSG,
          loaded: true,
        }
      ),
    };
  });

  describe('Workspace Selectors', () => {
    it('selectAllWorkspace() should return the list of Workspace', () => {
      const results = WorkspaceSelectors.selectAllWorkspace(state);
      const selId = getWorkspaceId(results[1]);

      expect(results.length).toBe(3);
      expect(selId).toBe('PRODUCT-BBB');
    });

    it('selectEntity() should return the selected Entity', () => {
      const result = WorkspaceSelectors.selectEntity(state) as WorkspaceEntity;
      const selId = getWorkspaceId(result);

      expect(selId).toBe('PRODUCT-BBB');
    });

    it('selectWorkspaceLoaded() should return the current "loaded" status', () => {
      const result = WorkspaceSelectors.selectWorkspaceLoaded(state);

      expect(result).toBe(true);
    });

    it('selectWorkspaceError() should return the current "error" state', () => {
      const result = WorkspaceSelectors.selectWorkspaceError(state);

      expect(result).toBe(ERROR_MSG);
    });
  });
});
