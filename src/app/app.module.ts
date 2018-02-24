
import { environment } from "./../environment/environment";

import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {
  NgModule, Injectable,
  Injector,
  InjectionToken,
  ErrorHandler,
  isDevMode
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpModule, RequestOptions, Http, XHRBackend } from "@angular/http";

// Routing
import { PathLocationStrategy, Location, LocationStrategy } from "@angular/common";
import { Routes, RouterModule, Router } from "@angular/router";

// Guards
import { AuthGuard } from "./shared/services/guards/auth.guard";
import { AccessGuard } from "./shared/services/guards/access.guard";
import { WorkspaceGuard } from "./shared/services/guards/workspace.guard";

// Services
import { DataService } from "./shared/services/data.service";
import { URIService } from "./shared/services/uri.service";
import { DatasetFactory } from "./shared/services/dataset.factory";
import { ColorService } from "./shared/services/ui/color.service"
import { UIService } from "./shared/services/ui/ui.service"
import { ErrorService } from "./shared/services/error/error.service";
import { Auth } from "./shared/services/auth/auth.service";
import { AuthHttp } from "angular2-jwt";
import { UserFactory } from "./shared/services/user.factory";
import { TeamFactory } from "./shared/services/team.factory";
import { MailingService } from "./shared/services/mailing/mailing.service"
import { UserService } from "./shared/services/user/user.service";
import { LoaderService } from "./shared/services/loading/loader.service";

// Components
import { LoginComponent } from "./components/login/login.component";
import { HomeComponent } from "./components/home/home.component";
import { AppComponent } from "./components/app.component";
import { MappingComponent } from "./components/mapping/mapping.component";
import { MappingTreeComponent } from "./components/mapping/tree/mapping.tree.component";
import { MemberSummaryComponent } from "./components/mapping/member-summary/member-summary.component";

import { InitiativeComponent } from "./components/initiative/initiative.component"
import { BuildingComponent } from "./components/building/building.component";
import { InitiativeNodeComponent } from "./components/building/initiative.node.component";

import { HelpComponent } from "./components/help/help.component";

import { AccountComponent } from "./components/account/account.component";
import { TeamComponent } from "./components/team/single/team-single.component";

import { WorkspaceComponent } from "./components/workspace/workspace.component";
import { FooterComponent } from "./components/footer/footer.component";
import { HeaderComponent } from "./components/header/header.component";

import { UnauthorizedComponent } from "./components/unauthorized/unauthorized.component";
import { NotFoundComponent } from "./components/unauthorized/not-found.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { SignupComponent } from "./components/login/signup.component";

// Analytics
import { Angulartics2Mixpanel, Angulartics2Module } from "angulartics2";

// Directives
import { FocusIfDirective } from "./shared/directives/focusif.directive";
// import { AutoSelectDirective } from "./shared/directives/autoselect.directive"
// import { AnchorDirective } from "./shared/directives/anchor.directivse"

// External libraries

import * as Rollbar from "rollbar";
import { ColorPickerModule } from "ngx-color-picker";
import { LoadingModule, ANIMATION_TYPES } from "ngx-loading";
import { MarkdownModule, MarkdownService } from "angular2-markdown";
import { FileUploadModule } from "ng2-file-upload";
import { CloudinaryModule } from "@cloudinary/angular-5.x";
import { Cloudinary } from "cloudinary-core";
import { D3Service } from "d3-ng2-service";
import { TreeModule } from "angular-tree-component";
import { Ng2Bs3ModalModule } from "ng2-bs3-modal/ng2-bs3-modal";
import { NgbModule, NgbTypeaheadModule } from "@ng-bootstrap/ng-bootstrap";
import { AuthConfiguration } from "./shared/services/auth/auth.config";
import { ResponsiveModule, } from "ng2-responsive";
import { ConfirmationPopoverModule } from "angular-confirmation-popover";
import { JwtEncoder } from "./shared/services/encoding/jwt.service";
// import { HttpService } from "./shared/services/http/http.service";
// import { HttpServiceFactory } from "./shared/services/http/htttp.service.factory";
import { TeamListComponent } from "./components/team/list/team-list.component";
import { authHttpServiceFactory } from "./shared/services/auth/auth.module";
import { ChangePasswordComponent } from "./components/login/change-password.component";
import { AnAnchorableComponent } from "../test/specs/shared/component.helper.shared";
// import { MappingNetworkComponent } from "./components/mapping/network/mapping.network.component";
import { LoaderComponent } from "./components/loading/loader.component";
import { DashboardComponentResolver } from "./components/dashboard/dashboard.resolver";
import { MappingNetworkComponent } from "./components/mapping/network/mapping.network.component";
import { WorkspaceComponentResolver } from "./components/workspace/workspace.resolver";
import { LogoutComponent } from "./components/login/logout.component";
import { ExportService } from "./shared/services/export/export.service";
import { FileService } from "./shared/services/file/file.service";
import { HttpLogInterceptor, httpFactory, HttpFactoryModule } from "./shared/services/auth/httpInterceptor";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { MappingZoomableComponent } from "./components/mapping/zoomable/mapping.zoomable.component";

import { McBreadcrumbsModule, McBreadcrumbsConfig } from "ngx-breadcrumbs";
import { TeamComponentResolver } from "./components/team/single/team-single.resolver";
import { SearchComponent } from "./components/search/search.component";
import { FilterTagsComponent } from "./components/filter/tags.component";
import { TeamSettingsComponent } from "./components/team/single/settings/settings.component";

// Routes
const appRoutes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },

  {
    path: "home", component: HomeComponent, data: { breadcrumbs: "Home" },


  },

  { path: "login", component: LoginComponent, data: { breadcrumbs: "Login" } },

  { path: "logout", component: LogoutComponent },
  { path: "help", component: HelpComponent, data: { breadcrumbs: "Help" } },
  { path: "signup", component: SignupComponent, data: { breadcrumbs: "Sign up" } },

  {
    path: "teams",
    data: { breadcrumbs: "Teams" },
    children: [
      { path: "", component: TeamListComponent, canActivate: [AuthGuard] },
      {
        path: ":teamid/:slug",
        resolve: {
          team: TeamComponentResolver
        },
        component: TeamComponent, data: { breadcrumbs: "{{team.name}}" },
        canActivate: [AuthGuard, AccessGuard]
      }
    ]

  },


  {
    path: ":shortid/:slug",
    component: AccountComponent,
    canActivate: [AuthGuard],
    data: { breadcrumbs: "Profile" }
  },

  {
    path: "map/:mapid/:mapslug",
    data: { breadcrumbs: "{{data.dataset.initiative.name}}" },
    component: WorkspaceComponent,
    canActivate: [AuthGuard, AccessGuard],
    resolve: {
      data: WorkspaceComponentResolver
    },
    children: [
      { path: "", redirectTo: "initiatives", pathMatch: "full" },
      { path: "initiatives", component: MappingZoomableComponent, canActivate: [WorkspaceGuard] },
      { path: "people", component: MappingTreeComponent, canActivate: [WorkspaceGuard] },
      { path: "connections", component: MappingNetworkComponent, canActivate: [WorkspaceGuard] },
      { path: "u/:usershortid/:userslug", component: MemberSummaryComponent, canActivate: [WorkspaceGuard] },
    ]
  },
  // { path: "summary/map/:mapid/:mapslug/u/:usershortid/:userslug", component: MemberSummaryComponent, canActivate: [AuthGuard, AccessGuard], canActivateChild: [AuthGuard, AccessGuard] },

  { path: "unauthorized", component: UnauthorizedComponent },
  { path: "forgot", component: ChangePasswordComponent, data: { breadcrumbs: "Password change" } },
  { path: "404", component: NotFoundComponent },
  { path: "**", redirectTo: "/404" }
];

export const cloudinaryLib = {
  Cloudinary: Cloudinary
};

export function markdownServiceFactory(http: Http) {
  let _markdown = new MarkdownService(http)
  _markdown.setMarkedOptions({ breaks: true })
  _markdown.renderer.link = (href: string, title: string, text: string) => {
    return `<a href=${href} class="markdown-link" target="_blank" title=${title}>${text}</a>`;
  }
  return _markdown
}

const rollbarConfig = {
  accessToken: environment.ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: process.env.ENV === "production" ? "production" : "development"
};

@Injectable()
export class RollbarErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) { }

  handleError(err: any): void {
    if (process.env.ENV === "production") {
      let rollbar = this.injector.get(RollbarService);
      rollbar.error(err.originalError || err);
    }
    else
      console.error(err)

  }
}

export function rollbarFactory() {
  return new Rollbar(rollbarConfig);
}

export const RollbarService = new InjectionToken<Rollbar>("rollbar");

@NgModule({
  declarations: [
    AppComponent, AccountComponent, HeaderComponent, FooterComponent, WorkspaceComponent, TeamComponent,
    MappingComponent, MappingTreeComponent, MappingNetworkComponent, MemberSummaryComponent, MappingZoomableComponent,
    BuildingComponent, InitiativeNodeComponent, LoginComponent, LogoutComponent, HomeComponent, UnauthorizedComponent, NotFoundComponent,
    InitiativeComponent, ChangePasswordComponent, LoaderComponent, TeamListComponent, SignupComponent,
    FocusIfDirective, SearchComponent, FilterTagsComponent, TeamSettingsComponent,
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
    TreeModule,
    McBreadcrumbsModule.forRoot(),
    NgbModule.forRoot(),
    RouterModule.forRoot(appRoutes),
    ResponsiveModule,
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: "danger",
      cancelButtonType: "secondary"
    }),
    MarkdownModule.forRoot(),
    Angulartics2Module.forRoot([Angulartics2Mixpanel]),
    FileUploadModule,
    LoadingModule.forRoot({
      animationType: ANIMATION_TYPES.chasingDots,
      backdropBackgroundColour: "#fff",
      backdropBorderRadius: ".25rem",
      primaryColour: "#EF5E26",
      secondaryColour: "#2F81B7",
      tertiaryColour: "#ffffff"
    }),
    HttpFactoryModule,
    ColorPickerModule,
    BrowserAnimationsModule,
    CloudinaryModule.forRoot(cloudinaryLib, { cloud_name: environment.CLOUDINARY_CLOUDNAME, upload_preset: environment.CLOUDINARY_UPLOAD_PRESET })
  ],
  exports: [RouterModule],
  providers: [
    BrowserAnimationsModule,
    AuthGuard, AccessGuard, WorkspaceGuard, AuthConfiguration,
    D3Service, DataService, URIService, ColorService, UIService, DatasetFactory, TeamFactory,
    ErrorService, Auth, UserService, UserFactory, MailingService, JwtEncoder, LoaderService,
    ExportService, FileService,
    Location,
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    // {
    //   provide: Http,
    //   useFactory: HttpFactory,
    //   deps: [XHRBackend, RequestOptions, ErrorHandler, Router]
    // },

    {
      provide: AuthHttp,
      useFactory: authHttpServiceFactory,
      deps: [Http, RequestOptions]
    },
    {
      provide: MarkdownService,
      useFactory: markdownServiceFactory,
      deps: [Http]
    },
    DashboardComponentResolver,
    WorkspaceComponentResolver,
    TeamComponentResolver,
    { provide: ErrorHandler, useClass: RollbarErrorHandler },
    { provide: RollbarService, useFactory: rollbarFactory }
  ],
  entryComponents: [AppComponent],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor(breadcrumbsConfig: McBreadcrumbsConfig) {

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
