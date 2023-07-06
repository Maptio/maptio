import { Injectable, inject } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import * as GlobalActions from './global.actions';
import * as GlobalFeature from './global.reducer';

@Injectable()
export class GlobalEffects {
  private actions$ = inject(Actions);

  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GlobalActions.initGlobal),
      switchMap(() => of(GlobalActions.loadGlobalSuccess({ global: [] }))),
      catchError((error) => {
        console.error('Error', error);
        return of(GlobalActions.loadGlobalFailure({ error }));
      })
    )
  );
}
