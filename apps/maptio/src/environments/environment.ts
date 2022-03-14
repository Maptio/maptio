// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  auth: {
    domain: 'maptio-dev.eu.auth0.com',
    clientId: 'rAcSdJBxn8gCq8Qtl2Xo9mI0lzTGtPIu',
    redirectUri: window.location.origin + '/login',
    scope: 'api',
    audience: 'http://localhost:4200/api/v1',
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
