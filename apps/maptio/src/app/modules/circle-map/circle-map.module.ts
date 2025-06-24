import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';

import { SatPopoverModule } from '@wjaspers/sat-popover';
import { MarkdownModule } from 'ngx-markdown';

import { SvgZoomPanComponent } from './svg-zoom-pan/svg-zoom-pan.component';
import { CircleMapComponent } from './circle-map.component';
import { CircleComponent } from './circle/circle.component';
import { CircleInfoComponent } from './circle-info/circle-info.component';
import { HelperAvatarComponent } from './helper-avatar/helper-avatar.component';
import { SearchComponent } from './search/search.component';
import { CircleMenuComponent } from './circle-menu/circle-menu.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
    MarkdownModule.forChild(),
    SatPopoverModule,
    SvgZoomPanComponent,
    CircleMapComponent,
    CircleComponent,
    CircleInfoComponent,
    HelperAvatarComponent,
    SearchComponent,
    CircleMenuComponent,
  ],
  exports: [CircleMapComponent],
})
export class CircleMapModule {}
