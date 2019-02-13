import { Location, LocationStrategy, PathLocationStrategy, APP_BASE_HREF } from "@angular/common";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import { CoreModule } from "./core/core.module";
import { AppRoutingModule } from "./app.routing";
import { AnalyticsModule } from "./core/analytics.module";
import { SharedModule } from "./shared/shared.module";
import { Angulartics2Module } from "angulartics2";
import { FullstoryModule, Fullstory, FullstoryConfig } from "ngx-fullstory";
import { environment } from "./config/environment";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        // angular
        BrowserModule,
        BrowserAnimationsModule,
        // routing
        AppRoutingModule,
        // analytics
        AnalyticsModule,

        // core & shared
        CoreModule,
        SharedModule.forRoot()
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

}
