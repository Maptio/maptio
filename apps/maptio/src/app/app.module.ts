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
