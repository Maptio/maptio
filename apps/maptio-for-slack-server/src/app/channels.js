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
      console.log('[INFO] Getting information about the team');
      const teamInfo = await this.slackWebClient.team.info({ token: this.token });
      const teamName = teamInfo?.team?.name;

      // Call the conversations.list method using the WebClient
      console.log('[INFO] Getting list of all channels');
      const channelsList = await this.slackWebClient.conversations.list({ token: this.token });

      let allUsers = [];
      for (const channel of channelsList.channels) {
        console.log('[INFO] Getting members for channel id: ', channel.id);
        const membersList = await this.slackWebClient.conversations.members({ token: this.token, channel: channel.id });
        console.log('[INFO] Got the following members: ', membersList.members);
        channel.members = membersList.members;
        allUsers = allUsers.concat(membersList.members);
      }
      allUsers = uniq(allUsers);
      console.log('[INFO] This is what the list of all users now looks like: ', allUsers);

      // let allMembersList = [];
      for (const userId of allUsers) {
        console.log('[INFO] Getting info about user with id: ', userId);
        const userInfo = await this.slackWebClient.users.info({ token: this.token, user: userId });
        this.peopleStore[userId] = this.convertSlackUserInfoToMaptioPerson(userInfo.user);
      }

      this.saveConversations(channelsList.channels);
      this.convertConversationsToDataset(channelsList.channels, teamName);
    }
    catch (error) {
      console.error(error);
    }
  }

  // Put conversations into the JavaScript object
  saveConversations(conversationsArray) {
    let conversationId = '';

    console.log('[INFO] Saving all channel info in memory');
    conversationsArray.forEach((conversation) => {
      // Key conversation info on its unique ID
      conversationId = conversation["id"];

      // Store the entire conversation object (you may not need all of the info)
      this.conversationsStore[conversationId] = conversation;
    });
  }

  convertConversationsToDataset(conversationsArray, teamName) {
    console.log('[INFO] Converting all channel info to a Maptio dataset');

    const visionInitiative = this.createInitiative(teamName, []);
    conversationsArray.forEach((conversation) => {
      const childInitiative = this.createInitiative(conversation.name, conversation.members);
      visionInitiative.children.push(childInitiative);
    });

    const dateTime = new Date();
    const rootInitiative = this.createInitiative(`${teamName} - imported at ` + dateTime, []);
    rootInitiative.children.push(visionInitiative);

    const dataset = this.createDataset(rootInitiative);
    this.saveDataset(dataset);
  }

  convertSlackUserInfoToMaptioPerson(slackUserInfo) {
    console.log('[INFO] Converting the following Slack user info: ', slackUserInfo);
    const maptioUserObject = {
      user_id: 'slack|' + slackUserInfo.id,
      firstname: slackUserInfo.profile.first_name,
      lastname: slackUserInfo.profile.last_name,
      name: slackUserInfo.real_name,
      email: slackUserInfo.profile.email,
      picture: slackUserInfo.profile.image_192,
    }
    console.log('[INFO] Converted to the following Maptio user info:', maptioUserObject);
    return maptioUserObject
  }

  createInitiative(name, members) {
    console.log('[INFO] Creating initiative with name:', name);
    console.log('[INFO] And the following members:', members);

    const helpers = members.map((memberId) => {
      console.log('[INFO] Requesting member from store:', memberId);
      return this.peopleStore[memberId];
    });

    console.log('[INFO] Got the following helpers in initiative:', helpers);

    const initiative = {
      "helpers": helpers,
      "tags": [],
      "name": name,
      "team_id": `${this.hardcodedTemporaryTargetTeam}`,
      "children": []
    };

    console.log('[INFO] Created the following initiative:', initiative);

    return initiative;
  }

  createDataset(rootInitiative) {
    return {
      initiative: rootInitiative
    };
  }

  saveDataset(dataset) {
    console.log('[INFO] Saving the following dataset to the database:', dataset);

    db.datasets.save(dataset, function (err, result) {
      if (err) {
        console.log('[ERROR] Failed to save dataset with error:', err);
      } else {
        console.log('[INFO] Successfully saved dataset to database:', result);
      }
    })
  }
}
