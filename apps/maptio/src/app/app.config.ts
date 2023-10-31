import { ApplicationConfig } from '@angular/core';
import { importProvidersFrom, isDevMode } from '@angular/core';
import {
  Location,
  LocationStrategy,
  PathLocationStrategy,
} from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { StoreModule, provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import {
  StoreDevtoolsModule,
  provideStoreDevtools,
} from '@ngrx/store-devtools';
import { AuthHttpInterceptor, AuthModule } from '@auth0/auth0-angular';
import { SubSink } from 'subsink';
import { MarkdownModule } from 'ngx-markdown';

import { authConfig, hammerProvider, markedConfig } from 'providers';

import { environment } from '../environments/environment';
import { AnalyticsModule } from './core/analytics.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app.routing';
import * as fromGlobal from './state/global.reducer';
import { GlobalEffects } from './state/global.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      BrowserModule,
      HammerModule,
      AppRoutingModule,
      AnalyticsModule,
      AuthModule.forRoot(authConfig),
      MarkdownModule.forRoot(markedConfig),
      CoreModule,
      SharedModule.forRoot(),

      // This is necessary here as we're still old and standalone NgRx APIs.
      // Note that this needs to be placed before `provideState` for the global
      // state to be available in the store.
      // See: https://github.com/ngrx/platform/issues/3700#issuecomment-1443965068
      StoreModule.forRoot()
    ),

    // NgRx Store configuration
    provideStore(),
    provideState(fromGlobal.GLOBAL_FEATURE_KEY, fromGlobal.globalReducer),
    provideStoreDevtools({
      name: 'Maptio',
      maxAge: 25,
      logOnly: environment.production,
    }),
    provideEffects(GlobalEffects),

    // BrowserAnimationsModule,
    Location,
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHttpInterceptor,
      multi: true,
    },
    hammerProvider,
    SubSink,
    provideAnimations(),
  ],
};
