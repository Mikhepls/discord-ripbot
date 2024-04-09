const { SlashCommandBuilder } = require('discord.js');

const openAI = require('../modules/openai');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask Ripbot anything. Ripbot will try to answer. (uses openAI gpt-4)')
    .addStringOption(option =>
      option
        .setName('prompt')
        .setDescription('What you want to ask Ripbot')
        .setMaxLength(500)
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const response = await openAI.askOpenAI(interaction, interaction.options.getString('prompt'));
    await interaction.editReply(response);
  }
};
