import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {HttpModule} from '@angular/http';

//Services
import {DataService} from './services/data.service';
import {DataSetService} from './services/dataset.service';
import {ColorService} from './services/color.service'
import {UIService} from './services/ui.service'

//Components
import { AppComponent } from './app.component';
import { MappingComponent } from './mapping/mapping.component';
import {InitiativeComponent} from './building/initiative.component'
import {BuildingComponent} from './building/building.component';

//Directives
import {FocusDirective} from './directives/focus.directive';

// External libraries
import { D3Service } from 'd3-ng2-service'; 
import { TreeModule } from 'angular2-tree-component';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    AppComponent,
    MappingComponent,
    BuildingComponent,
    InitiativeComponent,
    FocusDirective
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
  providers: [D3Service, DataService, ColorService, UIService, DataSetService], 
  entryComponents: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {

}