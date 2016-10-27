import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { MappingComponent } from './mapping/mapping.component';
import { D3Service } from 'd3-ng2-service'; // <-- import statement


@NgModule({
  declarations: [
    AppComponent,
    MappingComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule
  ],
  providers: [D3Service], // <-- provider registration
  entryComponents: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {

}