import {PermissionsBitField, SlashCommandBuilder} from "discord.js";

export const cmd = {
  data: new SlashCommandBuilder()
    .setName('saytense')
    .setDescription('Say to a user that he is tense')
    .addUserOption(option => option
      .setName('username')
      .setDescription('The user to whom say')
      .setRequired(true)),
  run: async (client, interaction) => {
    const user = interaction.member;

    if (user.voice !== null && user.voice.channel != null) {
      import('../services/tense-voice.service.js').then(async service => {
        service.sayTense(user.voice.channel, () => interaction.reply(`I will say to ${user.displayName} that he is tense.`))
      });
    } else {
      interaction.reply(`Cannot join ${user.displayName}, because he/she isn't connected on a vocal channel.`);
    }
  }
}
