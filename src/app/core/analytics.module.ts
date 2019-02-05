import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullstoryModule } from 'ngx-fullstory';
import { environment } from '../config/environment';
import { Angulartics2Module, Angulartics2Mixpanel } from 'angulartics2';
import { IntercomModule } from 'ng-intercom';

@NgModule({
    declarations: [],
    imports: [CommonModule,
        FullstoryModule.forRoot({
            fsOrg: environment.FULLSTORY_APP_ID,
            fsNameSpace: 'FS',
            fsDebug: false,
            fsHost: 'fullstory.com'
        }),
        Angulartics2Module.forRoot([Angulartics2Mixpanel]),
        IntercomModule.forRoot({
            appId: environment.INTERCOM_APP_ID, // from your Intercom config
            updateOnRouterChange: true // will automatically run `update` on router event changes. Default: `false`
        }),],
    exports: [
        FullstoryModule, Angulartics2Module, IntercomModule
    ],
    providers: [],
})
export class AnalyticsModule { }