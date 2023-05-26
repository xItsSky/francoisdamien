import {PermissionsBitField, SlashCommandBuilder} from "discord.js";

export const cmd = {
  data: new SlashCommandBuilder()
    .setName('moveout')
    .setDescription('Move out a specified player')
    .setDefaultMemberPermissions(PermissionsBitField.KickMembers)
    .addUserOption(option => option
      .setName('username')
      .setDescription('The user to move out')
      .setRequired(true)),
  run: async (client, interaction) => {
    const user = interaction.member;

    if (user.voice !== null && user.voice.channel != null) {
      import('../services/move-out-voice.service.js').then(async service => {
        service.sayMoveOut(user.voice.channel, () => user.voice.disconnect());
      }).then(
        interaction.reply(`I take care of moving out ${user.displayName}`)
      )
    } else {
      interaction.reply(`Cannot move out ${user.displayName} because he/she isn't connected on a vocal channel.`);
    }
  }
}
