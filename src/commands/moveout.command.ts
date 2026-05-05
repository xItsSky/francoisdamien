import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import type { SlashCommand } from '../types/slash-command.js';
import type { AppContext } from '../types/app-context.js';
import { AudioId } from '../types/audio.js';

async function execute(interaction: ChatInputCommandInteraction, ctx: AppContext): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({
      content: 'This command only works in a server.',
      ephemeral: true,
    });
    return;
  }
  const targetUser = interaction.options.getUser('username', true);
  const target = await interaction.guild.members.fetch(targetUser.id);
  const channel = target.voice.channel;
  if (!channel) {
    await interaction.reply({
      content: `Cannot move out ${target.displayName} — they are not in a voice channel.`,
      ephemeral: true,
    });
    return;
  }
  await interaction.reply({ content: `I will move out ${target.displayName}.` });
  await ctx.voice.joinAndPlay(channel, AudioId.MoveOut);
  await target.voice.disconnect();
}

export const cmd: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('moveout')
    .setDescription('Move out a specified player')
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
    .addUserOption((option) =>
      option.setName('username').setDescription('The user to move out').setRequired(true),
    ),
  execute,
};
