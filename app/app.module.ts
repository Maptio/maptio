import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { MappingComponent } from './mapping/mapping.component';
import {BuildingComponent} from './building/building.component';
import {DataService} from './services/data.service';
import { D3Service } from 'd3-ng2-service'; // <-- import statement
import {HttpModule} from '@angular/http';

@NgModule({
  declarations: [
    AppComponent,
    MappingComponent,
    BuildingComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpModule
  ],
  providers: [D3Service, DataService], // <-- provider registration
  entryComponents: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {

}