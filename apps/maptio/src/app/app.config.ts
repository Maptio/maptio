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
import { currentOrganisationIdReducer } from './state/current-organisation.reducer';
import * as fromGlobal from './state/global.reducer';
import { GlobalEffects } from './state/global.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideEffects(GlobalEffects),
    provideState(fromGlobal.GLOBAL_FEATURE_KEY, fromGlobal.globalReducer),
    provideStoreDevtools({ logOnly: !isDevMode() }),
    provideEffects(),
    provideStore(),
    importProvidersFrom(
      BrowserModule,
      HammerModule,
      AppRoutingModule,
      AnalyticsModule,
      AuthModule.forRoot(authConfig),
      MarkdownModule.forRoot(markedConfig),
      CoreModule,
      SharedModule.forRoot(),
      // TODO: Move all global state to newly scaffolded structures!
      StoreModule.forRoot({
        global: currentOrganisationIdReducer,
      }),
      StoreDevtoolsModule.instrument({
        name: 'Maptio',
        maxAge: 25,
        logOnly: environment.production,
      })
    ),
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
