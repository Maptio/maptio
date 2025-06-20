import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu'; // Import MatMenuModule

import { SatPopoverModule } from '@wjaspers/sat-popover';
import { MarkdownModule } from 'ngx-markdown';

import { SvgZoomPanComponent } from './svg-zoom-pan/svg-zoom-pan.component';
import { CircleMapComponent } from './circle-map.component';
import { CircleComponent } from './circle/circle.component';
import { CircleInfoComponent } from './circle-info/circle-info.component';
import { HelperAvatarComponent } from './helper-avatar/helper-avatar.component';
import { SearchComponent } from './search/search.component';
import { CircleMenuComponent } from './circle-menu/circle-menu.component'; // CircleMenuComponent is now standalone

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatMenuModule, // Add MatMenuModule to imports
    MarkdownModule.forChild(),
    SatPopoverModule,
    SvgZoomPanComponent, // Moved to imports
    CircleMapComponent, // Moved to imports
    CircleComponent, // Moved to imports
    CircleInfoComponent, // Moved to imports
    HelperAvatarComponent, // Moved to imports
    SearchComponent, // Moved to imports
    CircleMenuComponent, // Add CircleMenuComponent to imports as it's standalone
  ],
  declarations: [
    // Ensure all these components are in declarations
  ],
  exports: [
    CircleMapComponent,
    // If CircleMenuComponent is used outside this module and is not standalone, it should be exported.
  ],
})
export class CircleMapModule {}
