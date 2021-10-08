var mongojs = require('mongojs');
var db = mongojs(process.env.MONGODB_URI, ['datasets']);

import { uniq } from "lodash";

export class Channels {
  constructor(slackApp, token) {
    this.slackApp = slackApp;
    this.slackWebClient = this.slackApp.client;
    this.token = token;
    this.conversationsStore = {};
    this.peopleStore = {};
    this.hardcodedTemporaryTargetTeam = process.env.M4S_TARGET_TEAM;
  }

  async populateConversationStore() {
    try {
      // Call the conversations.list method using the WebClient
      const channelsList = await this.slackWebClient.conversations.list({ token: this.token });

      let allUsers = [];
      for (const channel of channelsList.channels) {
        const membersList = await this.slackWebClient.conversations.members({ token: this.token, channel: channel.id });
        channel.members = membersList.members;
        allUsers = allUsers.concat(membersList.members);
      }
      allUsers = uniq(allUsers);
      console.log(allUsers);

      // let allMembersList = [];
      for (const userId of allUsers) {
        const userInfo = await this.slackWebClient.users.info({ token: this.token, user: userId });
        this.peopleStore[userId] = this.convertSlackUserInfoToMaptioPerson(userInfo.user);
      }
      // allMembersList = uniq(allMembersList);
      // console.log(allMembersList);

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
    const visionInitiative = this.createInitiative('Imported Slack Channels Vision', []);
    conversationsArray.forEach((conversation) => {
      const childInitiative = this.createInitiative(conversation.name, conversation.members);
      visionInitiative.children.push(childInitiative);
    });

    const dateTime = new Date();
    const rootInitiative = this.createInitiative('Slack channels imported at ' + dateTime, []);
    rootInitiative.children.push(visionInitiative);

    const dataset = this.createDataset(rootInitiative);
    this.saveDataset(dataset);
  }

  convertSlackUserInfoToMaptioPerson(slackUserInfo) {
    console.log(slackUserInfo);
    return {
      user_id: 'slack|' + slackUserInfo.id,
      firstname: slackUserInfo.profile.first_name + ' SLACK',
      lastname: slackUserInfo.profile.last_name + ' SLACK',
      name: slackUserInfo.real_name + ' SLACK',
      email: slackUserInfo.profile.email,
      picture: slackUserInfo.profile.image_192,
    }
  }

  createInitiative(name, members) {
    const helpers = members.map((memberId) => {
      return this.peopleStore[memberId];
    });
    console.log('helpers', helpers);

    return {
      "helpers": helpers,
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
