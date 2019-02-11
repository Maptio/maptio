import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullstoryModule, Fullstory, FullstoryConfig } from 'ng-fullstory';
import { environment } from '../config/environment';
import { Angulartics2Module, Angulartics2Mixpanel, Angulartics2 } from 'angulartics2';
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
        Angulartics2Module.forRoot([Angulartics2Mixpanel]),
        IntercomModule.forRoot({
            appId: environment.INTERCOM_APP_ID, // from your Intercom config
            updateOnRouterChange: true // will automatically run `update` on router event changes. Default: `false`
        })],
    exports: [
        Angulartics2Module
    ],
    providers: [
        Intercom, Fullstory, FullstoryConfig, Angulartics2Mixpanel
    ],
})
export class AnalyticsModule {
    constructor() {

        if (process.env.NODE_ENV === "production") {
            LogRocket.init(environment.LOGROCKET_APP_ID, {
                network: {
                    isEnabled: true
                }

            });
        }
    }

 }