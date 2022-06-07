import { commonEnvironment } from "./environment.common";

export const environment = {
  ...commonEnvironment,

  production: true,

  INTERCOM_APP_ID: "q3x5lnhp",

  auth: {
    domain: 'login.maptio.com',
    clientId: 'hLMoi4RU80PH686BQ2GTlTg2lInzbXEB',
    redirectUri: window.location.origin + '/login',
    scope: 'api',
    audience: 'https://app.maptio.com/api/v1',
  },
  auth0DatabaseConnectionName: 'Username-Password-Authentication',
};
