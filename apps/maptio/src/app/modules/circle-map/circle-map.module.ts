import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SatPopoverModule } from '@ncstate/sat-popover';
import { MarkdownModule, } from "ngx-markdown";

import { SvgZoomPanComponent } from './svg-zoom-pan/svg-zoom-pan.component';
import { CircleMapComponent } from './circle-map.component';
import { CircleComponent } from './circle/circle.component';
import { CircleInfoComponent } from './circle-info/circle-info.component';
import { HelperAvatarComponent } from './helper-avatar/helper-avatar.component';

@NgModule({
  declarations: [
    SvgZoomPanComponent,
    CircleMapComponent,
    CircleComponent,
    CircleInfoComponent,
    HelperAvatarComponent,
  ],
  imports: [
    CommonModule,
    MarkdownModule.forChild(),
    SatPopoverModule,
  ],
  exports: [
    CircleMapComponent,
  ]
})
export class CircleMapModule { }
