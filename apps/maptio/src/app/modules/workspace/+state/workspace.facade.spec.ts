import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule, Store } from '@ngrx/store';
import { readFirst } from '@nx/angular/testing';

import * as WorkspaceActions from './workspace.actions';
import { WorkspaceEffects } from './workspace.effects';
import { WorkspaceFacade } from './workspace.facade';
import { WorkspaceEntity } from './workspace.models';
import {
  WORKSPACE_FEATURE_KEY,
  WorkspaceState,
  initialWorkspaceState,
  workspaceReducer,
} from './workspace.reducer';
import * as WorkspaceSelectors from './workspace.selectors';

interface TestSchema {
  workspace: WorkspaceState;
}

describe('WorkspaceFacade', () => {
  let facade: WorkspaceFacade;
  let store: Store<TestSchema>;
  const createWorkspaceEntity = (id: string, name = ''): WorkspaceEntity => ({
    id,
    name: name || `name-${id}`,
  });

  describe('used in NgModule', () => {
    beforeEach(() => {
      @NgModule({
        imports: [
          StoreModule.forFeature(WORKSPACE_FEATURE_KEY, workspaceReducer),
          EffectsModule.forFeature([WorkspaceEffects]),
        ],
        providers: [WorkspaceFacade],
      })
      class CustomFeatureModule {}

      @NgModule({
        imports: [
          StoreModule.forRoot({}),
          EffectsModule.forRoot([]),
          CustomFeatureModule,
        ],
      })
      class RootModule {}
      TestBed.configureTestingModule({ imports: [RootModule] });

      store = TestBed.inject(Store);
      facade = TestBed.inject(WorkspaceFacade);
    });

    /**
     * The initially generated facade::loadAll() returns empty array
     */
    it('loadAll() should return empty list with loaded == true', async () => {
      let list = await readFirst(facade.allWorkspace$);
      let isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(0);
      expect(isLoaded).toBe(false);

      facade.init();

      list = await readFirst(facade.allWorkspace$);
      isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(0);
      expect(isLoaded).toBe(true);
    });

    /**
     * Use `loadWorkspaceSuccess` to manually update list
     */
    it('allWorkspace$ should return the loaded list; and loaded flag == true', async () => {
      let list = await readFirst(facade.allWorkspace$);
      let isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(0);
      expect(isLoaded).toBe(false);

      store.dispatch(
        WorkspaceActions.loadWorkspaceSuccess({
          workspace: [
            createWorkspaceEntity('AAA'),
            createWorkspaceEntity('BBB'),
          ],
        })
      );

      list = await readFirst(facade.allWorkspace$);
      isLoaded = await readFirst(facade.loaded$);

      expect(list.length).toBe(2);
      expect(isLoaded).toBe(true);
    });
  });
});
