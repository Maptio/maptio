import { BrowserModule } from "@angular/platform-browser";
import { NgModule, ApplicationRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";

// Services
import { DataService } from "./shared/services/data.service";
import { DataSetService } from "./shared/services/dataset.service";
import { ColorService } from "./shared/services/color.service"
import { UIService } from "./shared/services/ui.service"
import { ErrorService } from "./shared/services/error.service";
import { Auth } from "./shared/services/auth.service";
import { AUTH_PROVIDERS } from "angular2-jwt";

// Components
import { AppComponent } from "./app.component";
import { MappingComponent } from "./components/mapping/mapping.component";
import { MappingCirclesComponent } from "./components/mapping/circles/mapping.circles.component";
import { MappingTreeComponent } from "./components/mapping/tree/mapping.tree.component";

import { InitiativeComponent } from "./components/initiative/initiative.component"
import { BuildingComponent } from "./components/building/building.component";
import { InitiativeNodeComponent } from "./components/building/initiative.node.component";

import { HelpComponent } from "./components/help/help.component";

// Directives
import { FocusIfDirective } from "./shared/directives/focusif.directive";
import { AutoSelectDirective } from "./shared/directives/autoselect.directive"
import { AnchorDirective } from "./shared/directives/anchor.directive"

// External libraries
import { D3Service } from "d3-ng2-service";
import { TreeModule } from "angular2-tree-component";
import { Ng2Bs3ModalModule } from "ng2-bs3-modal/ng2-bs3-modal";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";


@NgModule({
  declarations: [
    AppComponent,
    MappingComponent, MappingCirclesComponent, MappingTreeComponent,
    BuildingComponent, InitiativeNodeComponent,
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
    NgbModule.forRoot()
  ],
  providers: [D3Service, DataService, ColorService, UIService, DataSetService, ErrorService, AUTH_PROVIDERS, Auth],
  entryComponents: [AppComponent],
  bootstrap: [AppComponent]
})

export class AppModule {

}