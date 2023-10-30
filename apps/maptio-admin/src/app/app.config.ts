import { ApplicationConfig } from '@angular/core';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AuthModule } from '@auth0/auth0-angular';
import { environment } from '../environments/environment';
import {
  withEnabledBlockingInitialNavigation,
  provideRouter,
} from '@angular/router';
export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      BrowserModule,
      AuthModule.forRoot({ ...environment.auth })
    ),
    provideRouter([], withEnabledBlockingInitialNavigation()),
  ],
};
