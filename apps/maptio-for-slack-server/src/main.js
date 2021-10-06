/**
 * Based on code from https://github.com/slackapi/bolt-js-getting-started-app
 *
 * Implemented in JavaScript, not Typescript as at the time of writing TS
 * was considered incomplete, with users complaining that using TS makes
 * development with Bolt harder, sigh.
 */


// Using the Bolt package (github.com/slackapi/bolt)
import { App } from '@slack/bolt';

import { Channels } from './app/channels'


// Temporary code for testing / proof of concept
const databaseData = {};
const database = {
  set: async (key, data) => {
    databaseData[key] = data
  },
  get: async (key) => {
    return databaseData[key];
  },
};


// Initialize app with tokens
const app = new App({
  signingSecret: process.env.M4S_SLACK_SIGNING_SECRET,
  clientId: process.env.M4S_SLACK_CLIENT_ID,
  clientSecret: process.env.M4S_SLACK_CLIENT_SECRET,
  stateSecret: 'my-secret',
  scopes: [
    'channels:read',
    'users:read',
    // 'groups:read',
    // 'mpim:read',
    // 'im:read',
  ],
  installationStore: {
    storeInstallation: async (installation) => {
      if (!installation?.bot?.token) {
        throw new Error('Could not find bot token in installation', installation);
      }

      const channels = new Channels(app, installation.bot.token);
      await channels.populateConversationStore();
      // console.log(channels.conversationsStore);

      // change the lines below so they save to your database
      if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
        // support for org-wide app installation
        return await database.set(installation.enterprise.id, installation);
      }
      if (installation.team !== undefined) {
        // single team app installation
        return await database.set(installation.team.id, installation);
      }
      throw new Error('Failed saving installation data to installationStore');
    },
    fetchInstallation: async (installQuery) => {
      // change the lines below so they fetch from your database
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // org wide app installation lookup
        return await database.get(installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation lookup
        return await database.get(installQuery.teamId);
      }
      throw new Error('Failed fetching installation');
    },
    deleteInstallation: async (installQuery) => {
      // change the lines below so they delete from your database
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // org wide app installation deletion
        return await database.delete(installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation deletion
        return await database.delete(installQuery.teamId);
      }
      throw new Error('Failed to delete installation');
    },
  },
});


// (async () => {
//   const channels = new Channels(app);
//   await channels.populateConversationStore();
//   console.log(channels.conversationsStore);
// })();


(async () => {
  await app.start(process.env.PORT || 3001);
  console.log('⚡️ Bolt app is running!');
})();
