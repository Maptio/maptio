import { NgModule, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntercomModule, Intercom } from '@supy-io/ngx-intercom';

import { environment } from '@maptio-environment';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    IntercomModule.forRoot({
      appId: environment.INTERCOM_APP_ID, // from your Intercom config
      updateOnRouterChange: true, // will automatically run `update` on router event changes. Default: `false`
    }),
  ],
  providers: [Intercom],
})
export class AnalyticsModule {}
