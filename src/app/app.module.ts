import { HomeComponent } from './components/home/home.component';

import { BrowserModule } from "@angular/platform-browser";
import { NgModule, ApplicationRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";

// Routing
import { PathLocationStrategy, Location, LocationStrategy } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";

// Guards
import { AuthGuard } from './shared/services/auth.guard';

// Services
import { DataService } from "./shared/services/data.service";
import { DatasetFactory } from "./shared/services/dataset.factory";
import { ColorService } from "./shared/services/color.service"
import { UIService } from "./shared/services/ui.service"
import { ErrorService } from "./shared/services/error.service";
import { Auth } from "./shared/services/auth.service";
import { AUTH_PROVIDERS } from "angular2-jwt";
import { UserFactory } from "./shared/services/user.factory";

// Components
import { LoginComponent } from './components/login/login.component';

import { AppComponent } from "./app.component";
import { MappingComponent } from "./components/mapping/mapping.component";
import { MappingCirclesComponent } from "./components/mapping/circles/mapping.circles.component";
import { MappingTreeComponent } from "./components/mapping/tree/mapping.tree.component";

import { InitiativeComponent } from "./components/initiative/initiative.component"
import { BuildingComponent } from "./components/building/building.component";
import { InitiativeNodeComponent } from "./components/building/initiative.node.component";

import { HelpComponent } from "./components/help/help.component";

import { AccountComponent } from "./components/account/account.component";

import { WorkspaceComponent } from "./components/workspace/workspace.component";
import { FooterComponent } from "./components/footer/footer.component";
import { HeaderComponent } from "./components/header/header.component";

// Directives
import { FocusIfDirective } from "./shared/directives/focusif.directive";
import { AutoSelectDirective } from "./shared/directives/autoselect.directive"
import { AnchorDirective } from "./shared/directives/anchor.directive"

// External libraries
import { D3Service } from "d3-ng2-service";
import { TreeModule } from "angular2-tree-component";
import { Ng2Bs3ModalModule } from "ng2-bs3-modal/ng2-bs3-modal";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

// Routes
const appRoutes: Routes = [
  { path: "", redirectTo: "", pathMatch: "full",  component: HomeComponent  },

  { path: "login", component: LoginComponent },
  { path: "account", component: AccountComponent, canActivate: [AuthGuard] },
  { path: "workspace/:id", component: WorkspaceComponent, canActivate: [AuthGuard] }

];

@NgModule({
  declarations: [
    AppComponent, AccountComponent, HeaderComponent, FooterComponent, WorkspaceComponent,
    MappingComponent, MappingCirclesComponent, MappingTreeComponent,
    BuildingComponent, InitiativeNodeComponent, LoginComponent,HomeComponent,
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
    RouterModule.forRoot(appRoutes)
  ],
  exports: [RouterModule],
  providers: [
    AuthGuard,
    D3Service, DataService, ColorService, UIService, DatasetFactory, ErrorService, AUTH_PROVIDERS, Auth, UserFactory,
    Location, { provide: LocationStrategy, useClass: PathLocationStrategy }],
  entryComponents: [AppComponent],
  bootstrap: [AppComponent]
})

export class AppModule {

}