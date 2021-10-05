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
  // Start your app
  await app.start(process.env.PORT || 3001);

  console.log('⚡️ Bolt app is running!');
})();


//
// Code from most basic Slack/Bolt tutorials/examples
//

// // Listens to incoming messages that contain "hello"
// app.message('hello', async ({ message, say }) => {
//   // say() sends a message to the channel where the event was triggered
//   await say({
//     blocks: [
//       {
//         "type": "section",
//         "text": {
//           "type": "mrkdwn",
//           "text": `Hey there <@${message.user}>!`
//         },
//         "accessory": {
//           "type": "button",
//           "text": {
//             "type": "plain_text",
//             "text": "Click Me"
//           },
//           "action_id": "button_click"
//         }
//       }
//     ],
//     text: `Hey there <@${message.user}>!`
//   });
// });

// app.action('button_click', async ({ body, ack, say }) => {
//   // Acknowledge the action
//   await ack();
//   await say(`<@${body.user.id}> clicked the button`);
// });


//
// Code scaffolded with Nx
//

// import * as express from 'express';

// const app = express();

// app.get('/api', (req, res) => {
//   res.send({ message: 'Welcome to maptio-for-slack-server!' });
// });

// const port = process.env.port || 3333;
// const server = app.listen(port, () => {
//   console.log(`Listening at http://localhost:${port}/api`);
// });
// server.on('error', console.error);
