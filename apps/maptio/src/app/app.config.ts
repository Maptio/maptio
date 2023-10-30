import { ApplicationConfig } from '@angular/core';
import { importProvidersFrom } from '@angular/core';
import {
  Location,
  LocationStrategy,
  PathLocationStrategy,
} from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AuthHttpInterceptor, AuthModule } from '@auth0/auth0-angular';
import { SubSink } from 'subsink';
import { MarkdownModule } from 'ngx-markdown';

import { authConfig, hammerProvider, markedConfig } from 'providers';

import { environment } from '../environments/environment';
import { AnalyticsModule } from './core/analytics.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { currentOrganisationIdReducer } from './state/current-organisation.reducer';
import { AppRoutingModule } from './app.routing';

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
