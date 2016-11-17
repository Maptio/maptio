import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {HttpModule} from '@angular/http';

//Components
import { AppComponent } from './app.component';
import { MappingComponent } from './mapping/mapping.component';
import {BuildingComponent} from './building/building.component';
//import {InitiativeNode} from './building/initiative.component'

//Services
import {DataService} from './services/data.service';
import {ColorService} from './services/color.service'
import {UIService} from './services/ui.service'

//Directives
import {FocusDirective} from './directives/focus.directive';

// External libraries
import { D3Service } from 'd3-ng2-service'; 
import { TreeModule } from 'angular2-tree-component';



@NgModule({
  declarations: [
    AppComponent,
    MappingComponent,
    BuildingComponent,
  
    FocusDirective
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpModule,
    TreeModule
  ],
  providers: [D3Service, DataService, ColorService, UIService], 
  entryComponents: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {

}