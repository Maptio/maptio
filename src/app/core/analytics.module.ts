

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullstoryModule, Fullstory, FullstoryConfig } from 'ngx-fullstory';
import { environment } from '../config/environment';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2Mixpanel } from "angulartics2/mixpanel"
import { IntercomModule, Intercom } from 'ng-intercom';
import * as LogRocket from "logrocket";

@NgModule({
    declarations: [
    ],
    imports: [
        CommonModule,
        FullstoryModule.forRoot({
            fsOrg: environment.FULLSTORY_APP_ID,
            fsNameSpace: 'FS',
            fsDebug: false,
            fsHost: 'fullstory.com'
        }),
        Angulartics2Module.forRoot(),
        IntercomModule.forRoot({
            appId: environment.INTERCOM_APP_ID, // from your Intercom config
            updateOnRouterChange: true // will automatically run `update` on router event changes. Default: `false`
        })],
    exports: [
        Angulartics2Module, 
    ],
    providers: [
        Intercom,  Angulartics2Mixpanel, 
        Fullstory, FullstoryConfig,
    ],
})
export class AnalyticsModule {
    constructor(mixpanel: Angulartics2Mixpanel) {

        // if (process.env.NODE_ENV === "production") {
            LogRocket.init(environment.LOGROCKET_APP_ID, {
                network: {
                    isEnabled: true
                }

            });
            mixpanel.startTracking()
        // }
    }

}