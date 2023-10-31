import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { hot } from 'jasmine-marbles';
import { Observable } from 'rxjs';

import * as GlobalActions from './global.actions';
import { GlobalEffects } from './global.effects';

describe('GlobalEffects', () => {
  let actions: Observable<Action>;
  let effects: GlobalEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        GlobalEffects,
        provideMockActions(() => actions),
        provideMockStore(),
      ],
    });

    effects = TestBed.inject(GlobalEffects);
  });

  describe('init$', () => {
    it('should work', () => {
      actions = hot('-a-|', { a: GlobalActions.initGlobal() });

      const expected = hot('-a-|', {
        a: GlobalActions.loadGlobalSuccess({ global: [] }),
      });

      expect(effects.init$).toBeObservable(expected);
    });
  });
});
