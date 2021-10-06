var mongojs = require('mongojs');
var db = mongojs(process.env.MONGODB_URI, ['datasets']);

export class Channels {
  constructor(slackApp, token) {
    this.slackApp = slackApp;
    this.slackWebClient = this.slackApp.client;
    this.token = token;
    this.conversationsStore = {};
    this.hardcodedTemporaryTargetTeam = '605a45c943b21b0016b22e62';
  }

  async populateConversationStore() {
    try {
      // Call the conversations.list method using the WebClient
      const result = await this.slackWebClient.conversations.list({ token: this.token });

      // console.log(result.channels);
      this.saveConversations(result.channels);
      this.convertConversationsToDataset(result.channels);
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
