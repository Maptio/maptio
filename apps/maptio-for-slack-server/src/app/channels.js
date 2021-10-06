var mongojs = require('mongojs');
var db = mongojs(process.env.MONGODB_URI, ['datasets']);

import { uniq } from "lodash";

export class Channels {
  constructor(slackApp, token) {
    this.slackApp = slackApp;
    this.slackWebClient = this.slackApp.client;
    this.token = token;
    this.conversationsStore = {};
    this.membersStore = {};
    this.hardcodedTemporaryTargetTeam = '605a45c943b21b0016b22e62';
  }

  async populateConversationStore() {
    try {
      // Call the conversations.list method using the WebClient
      const channelsList = await this.slackWebClient.conversations.list({ token: this.token });

      let allMembersList = [];
      for (const channel of channelsList.channels) {
        const membersList = await this.slackWebClient.conversations.members({ token: this.token, channel: channel.id });
        channel.members = membersList.members;
        allMembersList = allMembersList.concat(membersList.members);
      }
      allMembersList = uniq(allMembersList);
      console.log(allMembersList);

      // console.log(result.channels);
      this.saveConversations(channelsList.channels);
      this.convertConversationsToDataset(channelsList.channels);
    }
    catch (error) {
      console.error(error);
    }
  }

  // Put conversations into the JavaScript object
  saveConversations(conversationsArray) {
    let conversationId = '';

    conversationsArray.forEach((conversation) => {
      // Key conversation info on its unique ID
      conversationId = conversation["id"];

      // Store the entire conversation object (you may not need all of the info)
      this.conversationsStore[conversationId] = conversation;
    });
  }

  convertConversationsToDataset(conversationsArray) {
    const visionInitiative = this.createEmtpyInitiative('Imported Slack Channels Vision');
    conversationsArray.forEach((conversation) => {
      const childInitiative = this.createEmtpyInitiative(conversation.name);
      visionInitiative.children.push(childInitiative);
    });

    const dateTime = new Date();
    const rootInitiative = this.createEmtpyInitiative('Slack channels imported at ' + dateTime);
    rootInitiative.children.push(visionInitiative);

    const dataset = this.createDataset(rootInitiative);
    this.saveDataset(dataset);
  }

  createEmtpyInitiative(name) {
    return {
      "helpers": [],
      "tags": [],
      "name": name,
      "team_id": `${this.hardcodedTemporaryTargetTeam}`,
      "children": []
    };
  }

  createDataset(rootInitiative) {
    return {
      initiative: rootInitiative
    };
  }

  saveDataset(dataset) {
    db.datasets.save(dataset, function (err, result) {
      if (err) {
        console.error(err)
      } else {
        console.log('successfully saved dataset', result);
      }
    })
  }
}
