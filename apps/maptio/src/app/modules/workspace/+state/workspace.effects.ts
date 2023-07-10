import { Injectable, inject } from '@angular/core';
// import { createEffect, Actions, ofType } from '@ngrx/effects';
// import { of } from 'rxjs';
// import { switchMap, catchError } from 'rxjs/operators';
// import * as WorkspaceActions from './workspace.actions';
// import * as WorkspaceFeature from './workspace.reducer';

@Injectable()
export class WorkspaceEffects {
  // private actions$ = inject(Actions);
  // init$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(WorkspaceActions.initWorkspace),
  //     switchMap(() =>
  //       of(WorkspaceActions.loadWorkspaceSuccess({ workspace: [] }))
  //     ),
  //     catchError((error) => {
  //       console.error('Error', error);
  //       return of(WorkspaceActions.loadWorkspaceFailure({ error }));
  //     })
  //   )
  // );
}
