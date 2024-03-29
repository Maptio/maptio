import { Injectable, NgModule } from '@angular/core';
import {
  Location,
  LocationStrategy,
  PathLocationStrategy,
  APP_BASE_HREF,
} from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  BrowserModule,
  HammerModule,
  HammerGestureConfig,
  HAMMER_GESTURE_CONFIG,
} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AuthHttpInterceptor, AuthModule } from '@auth0/auth0-angular';
import { SubSink } from 'subsink';
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';

import { environment } from '@maptio-environment';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { AnalyticsModule } from './core/analytics.module';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app.routing';

import { currentOrganisationIdReducer } from './state/current-organisation.reducer';

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
