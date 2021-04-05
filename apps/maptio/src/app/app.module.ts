import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { SvgZoomPanComponent } from './svg-zoom-pan/svg-zoom-pan.component';
import { CircleMapComponent } from './circle-map/circle-map.component';
import { CircleComponent } from './circle/circle.component';
import { CircleInfoComponent } from './circle-info/circle-info.component';


@NgModule({
  declarations: [
    AppComponent,
    SvgZoomPanComponent,
    CircleMapComponent,
    CircleComponent,
    CircleInfoComponent,
  ],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
