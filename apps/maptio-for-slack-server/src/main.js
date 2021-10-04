//
// Based on code from https://github.com/slackapi/bolt-js-getting-started-app
//

// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require('@slack/bolt');

// // Require the Node Slack SDK package (github.com/slackapi/node-slack-sdk)
const { WebClient, LogLevel } = require("@slack/web-api");

// Initialize app with tokens
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});


// WebClient insantiates a client that can call API methods
// When using Bolt, you can use either `app.client` or the `client` passed to listeners.
const client = new WebClient(process.env.SLACK_BOT_TOKEN, {
  // LogLevel can be imported and used to make debugging simpler
  logLevel: LogLevel.DEBUG
});

console.log('hello');

// You probably want to use a database to store any conversations information ;)
let conversationsStore = {};

async function populateConversationStore() {
  try {
    // Call the conversations.list method using the WebClient
    const result = await client.conversations.list();

    console.log(result.channels);
    saveConversations(result.channels);
  }
  catch (error) {
    console.error(error);
  }
}

// Put conversations into the JavaScript object
function saveConversations(conversationsArray) {
  let conversationId = '';

  conversationsArray.forEach(function(conversation){
    // Key conversation info on its unique ID
    conversationId = conversation["id"];

    // Store the entire conversation object (you may not need all of the info)
    conversationsStore[conversationId] = conversation;
  });
}

populateConversationStore();
console.log(conversationsStore);


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
