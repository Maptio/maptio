import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

// import { MaterialModule } from './material/material.module';

import { SatPopoverModule } from '@ncstate/sat-popover';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';

import { WorkspaceComponent } from './workspace/workspace.component';
import { SvgZoomPanComponent } from './svg-zoom-pan/svg-zoom-pan.component';
import { CircleMapComponent } from './circle-map/circle-map.component';
import { CircleComponent } from './circle/circle.component';
import { CircleInfoComponent } from './circle-info/circle-info.component';
import { HelperAvatarComponent } from './helper-avatar/helper-avatar.component';


@NgModule({
  declarations: [
    AppComponent,
    WorkspaceComponent,
    SvgZoomPanComponent,
    CircleMapComponent,
    CircleComponent,
    CircleInfoComponent,
    HelperAvatarComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    // MaterialModule,
    SatPopoverModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [
    AppComponent
  ],
})
export class AppModule {}
