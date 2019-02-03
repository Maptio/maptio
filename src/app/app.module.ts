import { PermissionGuard } from "./shared/services/guards/permission.guard";
import { PermissionService } from "./shared/model/permission.data";
import { Location, LocationStrategy, PathLocationStrategy, APP_BASE_HREF } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Http, HttpModule, RequestOptions } from "@angular/http";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule, Routes } from "@angular/router";
import { AuthHttp } from "angular2-jwt";
import { Angulartics2Mixpanel, Angulartics2Module } from "angulartics2";
import { BreadcrumbsModule, BreadcrumbsConfig, Breadcrumb } from "@exalif/ngx-breadcrumbs";
import { FullstoryModule } from 'ngx-fullstory';

import { DeviceDetectorModule } from 'ngx-device-detector';
import { AnAnchorableComponent } from "../test/specs/shared/component.helper.shared";
import { environment } from "../environment/environment";
import { AppComponent } from "./components/app.component";
import { NotFoundComponent } from "./components/unauthorized/not-found.component";
import { UnauthorizedComponent } from "./components/unauthorized/unauthorized.component";
import { AuthConfiguration } from "./shared/services/auth/auth.config";
import { authHttpServiceFactory } from "./shared/services/auth/auth.module";
import { Auth } from "./shared/services/auth/auth.service";
import { HttpFactoryModule } from "./shared/services/auth/httpInterceptor";
import { DatasetFactory } from "./shared/services/dataset.factory";
import { JwtEncoder } from "./shared/services/encoding/jwt.service";
import { ErrorService } from "./shared/services/error/error.service";
import { ExportService } from "./shared/services/export/export.service";
import { FileService } from "./shared/services/file/file.service";
import { AccessGuard } from "./shared/services/guards/access.guard";
import { AuthGuard } from "./shared/services/guards/auth.guard";
import { LoaderService } from "./shared/services/loading/loader.service";
import { MailingService } from "./shared/services/mailing/mailing.service";
import { TeamFactory } from "./shared/services/team.factory";
import { URIService } from "./shared/services/uri.service";
import { UserFactory } from "./shared/services/user.factory";
import { UserService } from "./shared/services/user/user.service";
import { IntercomModule } from 'ng-intercom';

import * as LogRocket from "logrocket";
import { BillingService } from "./shared/services/billing/billing.service";

import { NgProgressModule } from '@ngx-progressbar/core';
import { NgProgressRouterModule } from '@ngx-progressbar/router';
import { TeamService } from "./shared/services/team/team.service";
import { MapService } from "./shared/services/map/map.service";
import { InstructionsService } from "./shared/components/instructions/instructions.service";
import { OnboardingService } from "./shared/components/onboarding/onboarding.service";
import { LoaderComponent } from "./components/loading/loader.component";
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";


const appRoutes: Routes = [
    { path: "", redirectTo: "home", pathMatch: "full" },

    { path: "home", loadChildren: "./components/home/home.module#HomeModule" },

    {
        path: "", loadChildren: "./components/company/company.module#CompanyModule"
    },
    
    {
        path: "", loadChildren: "./components/login/login.module#LoginModule"
    },


    {
        path: "teams", loadChildren: "./components/team/team.module#TeamModule",
        data: { breadcrumbs: "Organisations" }
    },

    {
        path: "map/:mapid/:mapslug", loadChildren: "./components/workspace/workspace.module#WorkspaceModule"
    },

    
    { path: "unauthorized", component: UnauthorizedComponent },
    { path: "404", component: NotFoundComponent },
    { path: "**", redirectTo: "/404" },

];



@NgModule({
    declarations: [
        AppComponent, LoaderComponent, HeaderComponent, FooterComponent,
        UnauthorizedComponent, NotFoundComponent,
        AnAnchorableComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        DeviceDetectorModule.forRoot(),
        BreadcrumbsModule.forRoot(),
        RouterModule.forRoot(appRoutes, { enableTracing: false }),
        FullstoryModule.forRoot({
            fsOrg: environment.FULLSTORY_APP_ID,
            fsNameSpace: 'FS',
            fsDebug: false,
            fsHost: 'fullstory.com'
        }),
        Angulartics2Module.forRoot([Angulartics2Mixpanel]),
        NgProgressModule.forRoot(),
        NgProgressRouterModule,
        HttpFactoryModule,
        BrowserAnimationsModule,
        IntercomModule.forRoot({
            appId: environment.INTERCOM_APP_ID, // from your Intercom config
            updateOnRouterChange: true // will automatically run `update` on router event changes. Default: `false`
        })
    ],
    exports: [RouterModule],
    providers: [
        BrowserAnimationsModule,
        AuthGuard, AccessGuard, PermissionGuard,
        
        AuthConfiguration, URIService, DatasetFactory, TeamFactory,
        ErrorService, Auth, UserService, TeamService, MapService, UserFactory, MailingService, JwtEncoder, LoaderService,
        ExportService, FileService, PermissionService, BillingService, InstructionsService, OnboardingService,
        Location,
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        { provide: APP_BASE_HREF, useValue: '/' },
        {
            provide: AuthHttp,
            useFactory: authHttpServiceFactory,
            deps: [Http, RequestOptions]
        }
    ],
    entryComponents: [AppComponent],
    bootstrap: [AppComponent]
})

export class AppModule {
    constructor(breadcrumbsConfig: BreadcrumbsConfig) {

        if (process.env.NODE_ENV === "production") {
            LogRocket.init(environment.LOGROCKET_APP_ID, {
                network: {
                    isEnabled: true,
                }

            });
        }

        breadcrumbsConfig.postProcess = (breadcrumbs): Breadcrumb[] => {

            // Ensure that the first breadcrumb always points to home
            let processedBreadcrumbs = breadcrumbs;

            if (breadcrumbs.length && breadcrumbs[0].text !== 'Home') {
                processedBreadcrumbs = [
                    {
                        text: 'Home',
                        path: ''
                    }
                ].concat(breadcrumbs);
            }

            return processedBreadcrumbs;
        };
    }
}
