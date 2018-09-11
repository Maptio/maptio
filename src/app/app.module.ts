import { PermissionGuard } from "./shared/services/guards/permission.guard";
import { PermissionService } from "./shared/model/permission.data";
import { CommonModule, Location, LocationStrategy, PathLocationStrategy } from "@angular/common";
import { ErrorHandler, Injectable, InjectionToken, Injector, NgModule, Inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Http, HttpModule, RequestOptions } from "@angular/http";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule, Routes } from "@angular/router";
import { CloudinaryModule } from "@cloudinary/angular-5.x";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmationPopoverModule } from "angular-confirmation-popover";
import { AuthHttp } from "angular2-jwt";
import { Angulartics2Mixpanel, Angulartics2Module } from "angulartics2";
import { Cloudinary } from "cloudinary-core";
import { D3Service } from "d3-ng2-service";
import { FileUploadModule } from "ng2-file-upload";
import { ResponsiveModule } from "ng2-responsive";
import { McBreadcrumbsConfig, McBreadcrumbsModule } from "ngx-breadcrumbs";
// import { ANIMATION_TYPES, LoadingModule } from "ngx-loading";
import * as Rollbar from "rollbar";

import { AnAnchorableComponent } from "../test/specs/shared/component.helper.shared";
import { environment } from "../environment/environment";
import { AccountComponent } from "./components/account/account.component";
import { AppComponent } from "./components/app.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
// import { DashboardComponentResolver } from "./components/dashboard/dashboard.resolver";
import { FooterComponent } from "./components/footer/footer.component";
import { HeaderComponent } from "./components/header/header.component";
import { HelpComponent } from "./components/help/help.component";
import { HomeComponent } from "./components/home/home.component";
import { LoaderComponent } from "./components/loading/loader.component";
import { ChangePasswordComponent } from "./components/login/change-password.component";
import { LoginComponent } from "./components/login/login.component";
import { LogoutComponent } from "./components/login/logout.component";
import { SignupComponent } from "./components/login/signup.component";
import { TeamModule } from "./components/team/team.module";
import { NotFoundComponent } from "./components/unauthorized/not-found.component";
import { UnauthorizedComponent } from "./components/unauthorized/unauthorized.component";
import { WorkspaceModule } from "./components/workspace/workspace.module";
import { AuthConfiguration } from "./shared/services/auth/auth.config";
import { authHttpServiceFactory } from "./shared/services/auth/auth.module";
import { Auth } from "./shared/services/auth/auth.service";
import { HttpFactoryModule } from "./shared/services/auth/httpInterceptor";
import { DataService } from "./shared/services/data.service";
import { DatasetFactory } from "./shared/services/dataset.factory";
import { JwtEncoder } from "./shared/services/encoding/jwt.service";
import { ErrorService } from "./shared/services/error/error.service";
import { ExportService } from "./shared/services/export/export.service";
import { FileService } from "./shared/services/file/file.service";
import { AccessGuard } from "./shared/services/guards/access.guard";
import { AuthGuard } from "./shared/services/guards/auth.guard";
import { WorkspaceGuard } from "./shared/services/guards/workspace.guard";
import { LoaderService } from "./shared/services/loading/loader.service";
import { MailingService } from "./shared/services/mailing/mailing.service";
import { TeamFactory } from "./shared/services/team.factory";
import { ColorService } from "./shared/services/ui/color.service";
import { UIService } from "./shared/services/ui/ui.service";
import { URIService } from "./shared/services/uri.service";
import { UserFactory } from "./shared/services/user.factory";
import { UserService } from "./shared/services/user/user.service";
import { IntercomModule } from 'ng-intercom';

import * as LogRocket from "logrocket";
import { BillingService } from "./shared/services/billing/billing.service";
import { BillingGuard } from "./shared/services/guards/billing.guard";

import { NgProgressModule } from '@ngx-progressbar/core';
import { NgProgressRouterModule } from '@ngx-progressbar/router';
import { NgProgressHttpModule } from '@ngx-progressbar/http';
import { CreateMapComponent } from "./shared/components/create-map/create-map.component";
import { SharedModule } from "./shared/shared.module";
import { CommonComponentsModule } from "./shared/common-components.module";



const appRoutes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },

  { path: "home", component: HomeComponent, data: { breadcrumbs: "Home" }},

  { path: "login", component: LoginComponent, data: { breadcrumbs: "Login" } },

  { path: "logout", component: LogoutComponent },
  { path: "help", component: HelpComponent, data: { breadcrumbs: "Help" } },
  { path: "signup", component: SignupComponent, data: { breadcrumbs: "Sign up" } },

  {
    path: ":shortid/:slug",
    component: AccountComponent,
    canActivate: [AuthGuard],
    data: { breadcrumbs: "Profile" }
  },
  { path: "unauthorized", component: UnauthorizedComponent },
  { path: "forgot", component: ChangePasswordComponent, data: { breadcrumbs: "Reset password" } },
  { path: "404", component: NotFoundComponent },
  { path: "**", redirectTo: "/404" }
];

export const cloudinaryLib = {
  Cloudinary: Cloudinary
};



const rollbarConfig = {
  accessToken: environment.ROLLBAR_ACCESS_TOKEN,
  verbose: true,
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    environment: process.env.ENV === "production" ? "production" : "development"
  }

};

export const RollbarService = new InjectionToken<Rollbar>("rollbar");

@Injectable()
export class RollbarErrorHandler implements ErrorHandler {
  constructor(@Inject(RollbarService) private rollbar: Rollbar) { }

  handleError(err: any): void {
    this.rollbar.error(err.originalError || err);
  }
}



export function rollbarFactory() {
  return new Rollbar(rollbarConfig);
}




@NgModule({
  declarations: [
    AppComponent, AccountComponent, HeaderComponent, FooterComponent, LoginComponent, LogoutComponent, HomeComponent, UnauthorizedComponent, NotFoundComponent,
    ChangePasswordComponent, LoaderComponent, SignupComponent,
    HelpComponent,
    DashboardComponent,
    // for tests
    AnAnchorableComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpModule,
    McBreadcrumbsModule.forRoot(),
    NgbModule.forRoot(),
    RouterModule.forRoot(appRoutes, { enableTracing: false }),
    ResponsiveModule,
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: "danger",
      cancelButtonType: "outline-secondary"
    }),
    Angulartics2Module.forRoot([Angulartics2Mixpanel]),
    FileUploadModule,
    // LoadingModule.forRoot({
    //   animationType: ANIMATION_TYPES.threeBounce,
    //   fullScreenBackdrop: true,
    //   backdropBackgroundColour: "#f8f9fa",
    //   backdropBorderRadius: ".25rem",
    //   primaryColour: "#EF5E26",
    //   secondaryColour: "transparent",
    //   tertiaryColour: "#2F81B7"
    // }),
    NgProgressModule.forRoot(),
    NgProgressRouterModule,
    // NgProgressHttpModule,
    HttpFactoryModule,
    BrowserAnimationsModule,
    CloudinaryModule.forRoot(cloudinaryLib, { cloud_name: environment.CLOUDINARY_CLOUDNAME, upload_preset: environment.CLOUDINARY_UPLOAD_PRESET }),
    TeamModule,
    WorkspaceModule,
    IntercomModule.forRoot({
      appId: environment.INTERCOM_APP_ID, // from your Intercom config
      updateOnRouterChange: true // will automatically run `update` on router event changes. Default: `false`
    }),
    SharedModule,
    CommonComponentsModule

  ],
  exports: [RouterModule],
  providers: [
    BrowserAnimationsModule,
    AuthGuard, AccessGuard, WorkspaceGuard, PermissionGuard, BillingGuard,
    AuthConfiguration,
    D3Service, DataService, URIService, ColorService, UIService, DatasetFactory, TeamFactory,
    ErrorService, Auth, UserService, UserFactory, MailingService, JwtEncoder, LoaderService,
    ExportService, FileService, PermissionService, BillingService,
    Location,
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    {
      provide: AuthHttp,
      useFactory: authHttpServiceFactory,
      deps: [Http, RequestOptions]
    },
    // DashboardComponentResolver,
    // { provide: ErrorHandler, useClass: RollbarErrorHandler },
    // { provide: RollbarService, useFactory: rollbarFactory }
  ],
  entryComponents: [AppComponent],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor(breadcrumbsConfig: McBreadcrumbsConfig) {

    if (process.env.ENV === "production") {
      LogRocket.init("w3vkbz/maptio");
    }

    breadcrumbsConfig.postProcess = (x) => {
      // Ensure that the first breadcrumb always points to home

      let y = x;

      if (x.length && x[0].text !== "Home") {
        y = [
          {
            text: "Home",
            path: ""
          }
        ].concat(x);
      }

      return y;
    };
  }
}
