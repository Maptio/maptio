import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { hot } from 'jasmine-marbles';
import { Observable } from 'rxjs';

import * as WorkspaceActions from './workspace.actions';
import { WorkspaceEffects } from './workspace.effects';

describe('WorkspaceEffects', () => {
  let actions: Observable<Action>;
  let effects: WorkspaceEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        WorkspaceEffects,
        provideMockActions(() => actions),
        provideMockStore(),
      ],
    });

    effects = TestBed.inject(WorkspaceEffects);
  });

  describe('init$', () => {
    it('should work', () => {
      actions = hot('-a-|', { a: WorkspaceActions.initWorkspace() });

      const expected = hot('-a-|', {
        a: WorkspaceActions.loadWorkspaceSuccess({ workspace: [] }),
      });

      expect(effects.init$).toBeObservable(expected);
    });
  });
});
