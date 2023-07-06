import { createAction, props } from '@ngrx/store';
import { GlobalEntity } from './global.models';

export const initGlobal = createAction('[Global Page] Init');

export const loadGlobalSuccess = createAction(
  '[Global/API] Load Global Success',
  props<{ global: GlobalEntity[] }>()
);

export const loadGlobalFailure = createAction(
  '[Global/API] Load Global Failure',
  props<{ error: any }>()
);
