import { enableProdMode, Injectable, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import 'hammerjs';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { currentOrganisationIdReducer } from './app/state/current-organisation.reducer';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from './app/shared/shared.module';
import { CoreModule } from './app/core/core.module';
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { environment as environment_1 } from '@maptio-environment';
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

// Override default Hammer.js configuration for SVG zoom and pan gesture support
@Injectable()
export class CustomHammerConfig extends HammerGestureConfig {
  overrides = {
    pan: {
      direction: Hammer.DIRECTION_ALL, // Enable vertical panning too
      threshold: 0, // Make the smallest movements trigger panning
    },
  };
}

export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();

  renderer.link = (href: string, title: string, text: string) => {
    let linkHtml = `<a href=${href} class="markdown-link" target="_blank"`;

    if (title) {
      linkHtml += ` title="${title}"`;
    }

    linkHtml += `>${text}</a>`;

    return linkHtml;
  };

  renderer.paragraph = (text: string) => {
    return `<p class="markdown">${text}</p>`;
  };

  renderer.listitem = (text: string) => {
    return text.includes('type="checkbox"')
      ? `<li class="task-list-item">${text}</li>`
      : `<li>${text}</li>`;
  };

  return {
    renderer: renderer,
    breaks: true,
    smartLists: true,
  };
}

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
