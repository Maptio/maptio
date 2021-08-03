import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SatPopoverModule } from '@ncstate/sat-popover';

import { SvgZoomPanComponent } from './svg-zoom-pan/svg-zoom-pan.component';
import { CircleMapComponent } from './circle-map.component';

@NgModule({
  declarations: [
    SvgZoomPanComponent,
    CircleMapComponent,
  ],
  imports: [
    CommonModule,
    SatPopoverModule,
  ],
  exports: [
    CircleMapComponent,
  ]
})
export class CircleMapModule { }
