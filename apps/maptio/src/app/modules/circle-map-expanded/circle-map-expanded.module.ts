import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SatPopoverModule } from '@ncstate/sat-popover';
import { MarkdownModule } from 'ngx-markdown';

import { SvgZoomPanComponent } from './svg-zoom-pan/svg-zoom-pan.component';
import { CircleMapExpandedComponent } from './circle-map-expanded.component';
import { CircleComponent } from './circle/circle.component';
import { CircleInfoComponent } from './circle-info/circle-info.component';
import { HelperAvatarComponent } from './helper-avatar/helper-avatar.component';
import { CircleInfoSvgComponent } from './circle-info-svg/circle-info-svg.component';
import { HelperAvatarSvgComponent } from './helper-avatar-svg/helper-avatar-svg.component';
import { TagSvgComponent } from './tag-svg/tag-svg.component';

@NgModule({
  declarations: [
    SvgZoomPanComponent,
    CircleMapExpandedComponent,
    CircleComponent,
    CircleInfoComponent,
    CircleInfoSvgComponent,
    HelperAvatarComponent,
    HelperAvatarSvgComponent,
    TagSvgComponent,
  ],
  imports: [CommonModule, MarkdownModule.forChild(), SatPopoverModule],
  exports: [CircleMapExpandedComponent],
})
export class CircleMapExpandedModule {}
