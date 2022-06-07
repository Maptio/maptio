// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --configuration=staging` replaces `environment.ts` with `environment.staging.ts`.
// The list of file replacements can be found in `angular.json`.

import { commonEnvironment } from "./environment.common";

export const environment = {
  ...commonEnvironment,

  production: false,

  // Test environment (same as development as intercom only allows one test
  // environment per production one)
  INTERCOM_APP_ID: 'vrs3fjbv',

  auth: {
    domain: 'maptio-staging.us.auth0.com',
    clientId: 'TlJstdtRcRi1rlPM4iBCIYcHjdzSyPiD',
    redirectUri: window.location.origin + '/login',
    scope: 'api',
    audience: 'https://maptio-staging.herokuapp.com/api/v1',
  },
  auth0DatabaseConnectionName: 'Username-Password-Authentication',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
