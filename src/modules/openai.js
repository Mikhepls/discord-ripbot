const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_TOKEN
});
const openai = new OpenAIApi(configuration);
const model = 'gpt-4';

const starter = {
  role: 'system',
  content:
    'Your name is Ripbot. You are connected to a chat channel with multiple users. \
  Try to answer the questions concisely as best as you can, keeping the question history in mind. \
  Try to take both previous questions and answers into account. \
  Never include "You answered:" in your response. \
  There will likely be a mix of Finnish and English, please answer in the language the question was presented.'
};

// array to store channelHistories in, kept in running memory, max length 15
const channels = [];

const addMessageToChannel = (channelId, message) => {
  const channel = channels.find(channel => channel.channelId === channelId);
  if (channel) {
    channel.messages.push(message);
    if (channel.messages.length > 15) {
      channel.messages.shift();
    }
  } else {
    channels.push({ channelId, messages: [message] });
  }
};

const getContext = channelId => {
  const context = {
    role: 'user',
    content: ''
  };
  const channel = channels.find(channel => channel.channelId === channelId);
  if (channel) {
    for (const message of channel.messages) {
      if (message.user !== 'system') {
        context.content = context.content.concat(`${message.user} asked: ${message.content}
        `);
      } else {
        context.content = context.content.concat(`You answered: ${message.content}
        `);
      }
    }
    return context;
  }
  return context;
};

const askOpenAI = async (interaction, prompt) => {
  const { channelId, user, member } = interaction;
  addMessageToChannel(channelId, { user: member.nickname || user.globalName || user.username, content: prompt });
  const context = getContext(channelId);
  const response = await openai.createChatCompletion({
    model,
    messages: [starter, context]
  });
  addMessageToChannel(channelId, { user: 'system', content: response.data.choices[0].message.content });
  return response.data.choices[0].message.content;
};

module.exports = {
  askOpenAI
};
