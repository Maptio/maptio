export class Channels {
  constructor(slackApp) {
    this.slackApp = slackApp;
    this.slackWebClient = this.slackApp.client;
    this.conversationsStore = {};
  }

  async populateConversationStore() {
    try {
      // Call the conversations.list method using the WebClient
      const result = await this.slackWebClient.conversations.list();

      // console.log(result.channels);
      this.saveConversations(result.channels);
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
}
