import { ManagementClient } from 'auth0';

import authConfig from './config';


let authManagementClient;


function setUpAuth0ManagementClient() {
  authManagementClient = new ManagementClient({
    domain: authConfig.domain,
    clientId: authConfig.clientId,
    clientSecret: authConfig.clientSecret
  });
}

function getAuth0MangementClient() {
  return authManagementClient;
}


export { setUpAuth0ManagementClient, getAuth0MangementClient };
