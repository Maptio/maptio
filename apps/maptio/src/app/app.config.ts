import { ApplicationConfig } from '@angular/core';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import {
  BrowserModule,
  HammerModule,
  bootstrapApplication,
} from '@angular/platform-browser';
import { AppRoutingModule } from './app.routing';
import { AnalyticsModule } from './core/analytics.module';
import { AuthHttpInterceptor, AuthModule } from '@auth0/auth0-angular';
import { authConfig, hammerProvider, markedConfig } from 'providers';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import {
  Location,
  LocationStrategy,
  PathLocationStrategy,
} from '@angular/common';
import { SubSink } from 'subsink';
import { provideAnimations } from '@angular/platform-browser/animations';
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
