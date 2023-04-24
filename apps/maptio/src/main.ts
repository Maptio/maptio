import { enableProdMode, Injectable, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import 'hammerjs';

import { CustomHammerConfig, markedOptionsFactory } from './app/app.module';
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
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig, BrowserModule, HammerModule, bootstrapApplication } from '@angular/platform-browser';
import { AuthHttpInterceptor, AuthModule } from '@auth0/auth0-angular';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

const renderer = new MarkedRenderer();
let linkHtml = `<a href=${href} class="markdown-link" target="_blank"`;



if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(
        // angular
        BrowserModule, HammerModule, 
        // routing
        AppRoutingModule, 
        // analytics
        AnalyticsModule, AuthModule.forRoot({
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
        }), MarkdownModule.forRoot({
            markedOptions: {
                provide: MarkedOptions,
                useFactory: markedOptionsFactory,
            },
        }), 
        // core & shared
        CoreModule, SharedModule.forRoot(), StoreModule.forRoot({
            global: currentOrganisationIdReducer,
        }), StoreDevtoolsModule.instrument({
            name: 'Maptio',
            maxAge: 25,
            logOnly: environment.production,
        })),
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
        provideAnimations()
    ]
})
  .catch((err) => console.error(err));
