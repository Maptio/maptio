import { enableProdMode, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { AuthModule } from '@auth0/auth0-angular';
import { withEnabledBlockingInitialNavigation, provideRouter } from '@angular/router';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, AuthModule.forRoot({ ...environment.auth })),
        provideRouter([], withEnabledBlockingInitialNavigation())
    ]
})
  .catch((err) => console.error(err));
