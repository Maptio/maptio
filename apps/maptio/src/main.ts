import { enableProdMode, importProvidersFrom } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  Location,
  LocationStrategy,
  PathLocationStrategy,
} from '@angular/common';
import {
  BrowserModule,
  HammerModule,
  bootstrapApplication,
} from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreModule } from '@ngrx/store';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { SubSink } from 'subsink';
import { AuthHttpInterceptor, AuthModule } from '@auth0/auth0-angular';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { currentOrganisationIdReducer } from './app/state/current-organisation.reducer';
import { SharedModule } from './app/shared/shared.module';
import { CoreModule } from './app/core/core.module';
import { AnalyticsModule } from './app/core/analytics.module';
import { AppRoutingModule } from './app/app.routing';

import 'hammerjs';

import { authConfig, hammerProvider, markedConfig } from 'providers';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
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
}).catch((err) => console.error(err));
