
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";

// Routing
import { PathLocationStrategy, Location, LocationStrategy } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";

// Guards
import { AuthGuard } from "./shared/services/auth/auth.guard";
import { AccessGuard } from "./shared/services/auth/access.guard";

// Services
import { DataService } from "./shared/services/data.service";
import { DatasetFactory } from "./shared/services/dataset.factory";
import { ColorService } from "./shared/services/ui/color.service"
import { UIService } from "./shared/services/ui/ui.service"
import { ErrorService } from "./shared/services/error/error.service";
import { Auth } from "./shared/services/auth/auth.service";
import { AUTH_PROVIDERS } from "angular2-jwt";
import { UserFactory } from "./shared/services/user.factory";
import { TeamFactory } from "./shared/services/team.factory";

// Components
import { LoginComponent } from "./components/login/login.component";
import { HomeComponent } from "./components/home/home.component";
import { AppComponent } from "./components/app.component";
import { MappingComponent } from "./components/mapping/mapping.component";
import { MappingCirclesComponent } from "./components/mapping/circles/mapping.circles.component";
import { MappingTreeComponent } from "./components/mapping/tree/mapping.tree.component";
import { TooltipComponent } from "./components/mapping/tooltip/tooltip.component";

import { InitiativeComponent } from "./components/initiative/initiative.component"
import { BuildingComponent } from "./components/building/building.component";
import { InitiativeNodeComponent } from "./components/building/initiative.node.component";

import { HelpComponent } from "./components/help/help.component";

import { AccountComponent } from "./components/account/account.component";

import { WorkspaceComponent } from "./components/workspace/workspace.component";
import { FooterComponent } from "./components/footer/footer.component";
import { HeaderComponent } from "./components/header/header.component";

import { UnauthorizedComponent } from "./components/unauthorized/unauthorized.component";
import { TeamComponent } from "./components/team/team.component";

// Directives
import { FocusIfDirective } from "./shared/directives/focusif.directive";
import { AutoSelectDirective } from "./shared/directives/autoselect.directive"
import { AnchorDirective } from "./shared/directives/anchor.directive"

// External libraries
import { D3Service } from "d3-ng2-service";
import { TreeModule } from "angular2-tree-component";
import { Ng2Bs3ModalModule } from "ng2-bs3-modal/ng2-bs3-modal";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { AuthConfiguration } from "./shared/services/auth/auth.config";
import { ResponsiveModule, } from "ng2-responsive";
import { ConfirmationPopoverModule } from "angular-confirmation-popover";

// Routes
const appRoutes: Routes = [
  { path: "", redirectTo: "", pathMatch: "full", component: HomeComponent },

  { path: "login", component: LoginComponent },
  { path: "account", component: AccountComponent, canActivate: [AuthGuard] },
  { path: "account/teams", component: TeamComponent, canActivate: [AuthGuard] },
  { path: "account/team/:teamid", component: TeamComponent, canActivate: [AuthGuard, AccessGuard] },
  { path: "account/profile", component: AccountComponent, canActivate: [AuthGuard] },
  { path: "map/:workspaceid", component: WorkspaceComponent, canActivate: [AuthGuard, AccessGuard], canActivateChild: [AuthGuard, AccessGuard] },
  { path: "map/:workspaceid/i/:slug", component: WorkspaceComponent, canActivate: [AuthGuard, AccessGuard], canActivateChild: [AuthGuard, AccessGuard] },

  { path: "unauthorized", component: UnauthorizedComponent }

];

@NgModule({
  declarations: [
    AppComponent, AccountComponent, HeaderComponent, FooterComponent, WorkspaceComponent, TeamComponent,
    MappingComponent, MappingCirclesComponent, MappingTreeComponent, TooltipComponent,
    BuildingComponent, InitiativeNodeComponent, LoginComponent, HomeComponent, UnauthorizedComponent,
    InitiativeComponent,
    FocusIfDirective,
    AutoSelectDirective,
    AnchorDirective,
    HelpComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpModule,
    TreeModule,
    Ng2Bs3ModalModule,
    NgbModule.forRoot(),
    RouterModule.forRoot(appRoutes),
    ResponsiveModule,
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: "danger"
    })
  ],
  exports: [RouterModule],
  providers: [
    AuthGuard, AccessGuard, AuthConfiguration,
    D3Service, DataService, ColorService, UIService, DatasetFactory, TeamFactory, ErrorService, AUTH_PROVIDERS, Auth, UserFactory,
    Location, { provide: LocationStrategy, useClass: PathLocationStrategy }],
  entryComponents: [AppComponent],
  bootstrap: [AppComponent]
})

export class AppModule {

}
