import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

//Services
import { DataService } from './services/data.service';
import { DataSetService } from './services/dataset.service';
import { ColorService } from './services/color.service'
import { UIService } from './services/ui.service'
import { ErrorService } from './services/error.service';
import {TreeExplorationService} from './services/tree.exploration.service';

//Components
import { AppComponent } from './app.component';
import { MappingComponent } from './mapping/mapping.component';
import { MappingCirclesComponent } from './mapping/circles/mapping.circles.component';
import { MappingTreeComponent } from './mapping/tree/mapping.tree.component';

import { InitiativeComponent } from './initiative/initiative.component'
import { BuildingComponent } from './building/building.component';
import { HelpComponent } from './help/help.component';
//import {ImportComponent} from './import/import.component';

//Directives
import { FocusDirective } from './directives/focus.directive';
import { AutoSelectDirective } from './directives/autoselect.directive'
import { AnchorDirective } from './directives/anchor.directive'
//import { FileSelectDirective, FileDropDirective } from 'ng2-file-upload';

// External libraries
import { D3Service } from 'd3-ng2-service';
import { TreeModule } from 'angular2-tree-component';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    AppComponent,
    MappingComponent, MappingCirclesComponent, MappingTreeComponent,
    BuildingComponent,
    InitiativeComponent,
    FocusDirective,
    AutoSelectDirective,
    AnchorDirective,
    //FileSelectDirective,FileDropDirective,
    HelpComponent,
    // ImportComponent
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
  providers: [D3Service, DataService, ColorService, UIService, DataSetService,ErrorService, TreeExplorationService],
  entryComponents: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {

}