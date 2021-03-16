import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { CircleMapComponent } from './circle-map/circle-map.component';
import { CircleComponent } from './circle/circle.component';
import { CircleInfoComponent } from './circle-info/circle-info.component';


@NgModule({
  declarations: [AppComponent, CircleMapComponent, CircleComponent, CircleInfoComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
