export const environment = {
  production: true,

  auth: {
    domain: 'circlemapping.auth0.com',
    clientId: 'hLMoi4RU80PH686BQ2GTlTg2lInzbXEB',
    redirectUri: window.location.origin + '/login',
    scope: 'api',
    audience: 'https://app.maptio.com/api/v1',
  },
  auth0DatabaseConnectionName: 'Username-Password-Authentication',
};
