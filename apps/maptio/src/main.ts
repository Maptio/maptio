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
import { provideAnimations } from '@angular/platform-browser/animations';
import { SubSink } from 'subsink';
import {
  HAMMER_GESTURE_CONFIG,
  HammerGestureConfig,
  BrowserModule,
  HammerModule,
  bootstrapApplication,
} from '@angular/platform-browser';
import { AuthHttpInterceptor, AuthModule } from '@auth0/auth0-angular';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  Location,
  LocationStrategy,
  PathLocationStrategy,
} from '@angular/common';

const renderer = new MarkedRenderer();
let linkHtml = `<a href=${href} class="markdown-link" target="_blank"`;

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      // angular
      BrowserModule,
      HammerModule,
      // routing
      AppRoutingModule,
      // analytics
      AnalyticsModule,
      AuthModule.forRoot({
        ...environment.auth,
        httpInterceptor: {
          allowedList: [
            {
              uri: `/api/v1/embeddable-dataset/*`,
              allowAnonymous: true,
            },
            {
              uri: `/api/*`,
              tokenOptions: {
                audience: environment.auth.audience,
                scope: 'api',
              },
            },
          ],
        },
      }),
      MarkdownModule.forRoot({
        markedOptions: {
          provide: MarkedOptions,
          useFactory: markedOptionsFactory,
        },
      }),
      // core & shared
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
    { provide: HAMMER_GESTURE_CONFIG, useClass: CustomHammerConfig },
    SubSink,
    provideAnimations(),
  ],
}).catch((err) => console.error(err));
