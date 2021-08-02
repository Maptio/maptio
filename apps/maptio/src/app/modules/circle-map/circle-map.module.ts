import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SatPopoverModule } from '@ncstate/sat-popover';

import { SvgZoomPanComponent } from './svg-zoom-pan/svg-zoom-pan.component';
import { CircleComponent } from './circle/circle.component';
import { CircleInfoComponent } from './circle-info/circle-info.component';
import { HelperAvatarComponent } from './helper-avatar/helper-avatar.component';


@NgModule({
  declarations: [
    SvgZoomPanComponent,
    CircleComponent,
    CircleInfoComponent,
    HelperAvatarComponent,
  ],
  imports: [
    CommonModule,
    SatPopoverModule,
  ],
  exports: [
    SvgZoomPanComponent,
  ]
})
export class CircleMapModule { }
