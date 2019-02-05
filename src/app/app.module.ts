import { Location, LocationStrategy, PathLocationStrategy, APP_BASE_HREF } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { environment } from "./config/environment";
import { AppComponent } from "./app.component";
import * as LogRocket from "logrocket";
import { CoreModule } from "./core/core.module";
import { AppRoutingModule } from "./app.routing";
import { HttpFactoryModule } from "./core/interceptors/httpInterceptor";
import { AnalyticsModule } from "./core/analytics.module";
import { SharedModule } from "./shared/shared.module";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,
        AppRoutingModule,
        AnalyticsModule,
        HttpFactoryModule,
        BrowserAnimationsModule,
        CoreModule,
        SharedModule
    ],
    exports: [RouterModule],
    providers: [
        BrowserAnimationsModule,
        Location,
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        { provide: APP_BASE_HREF, useValue: '/' }
    ],
    entryComponents: [AppComponent],
    bootstrap: [AppComponent]
})

export class AppModule {
    constructor() {

        if (process.env.NODE_ENV === "production") {
            LogRocket.init(environment.LOGROCKET_APP_ID, {
                network: {
                    isEnabled: true,
                }

            });
        }
    }
}
