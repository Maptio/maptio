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


// Initialize app with tokens
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});


(async () => {
  const channels = new Channels(app);
  await channels.populateConversationStore();
  console.log(channels.conversationsStore);
})();


(async () => {
  await app.start(process.env.PORT || 3001);
  console.log('⚡️ Bolt app is running!');
})();
