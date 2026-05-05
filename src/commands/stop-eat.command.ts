import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type VoiceBasedChannel,
} from 'discord.js';
import type { SlashCommand } from '../types/slash-command.js';
import type { AppContext } from '../types/app-context.js';
import { AudioId } from '../types/audio.js';

async function execute(interaction: ChatInputCommandInteraction, ctx: AppContext): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({ content: 'This command only works in a server.', ephemeral: true });
    return;
  }
  const targetUser = interaction.options.getUser('username', true);
  const target = await interaction.guild.members.fetch(targetUser.id);
  const channel = target.voice.channel as VoiceBasedChannel | null;
  if (!channel) {
    await interaction.reply({
      content: `Cannot reach ${target.displayName} — they are not in a voice channel.`,
      ephemeral: true,
    });
    return;
  }
  await interaction.reply({ content: `I'll forward the message to ${target.displayName}.` });
  await ctx.voice.joinAndPlay(channel, AudioId.StopEating);
}

export const cmd: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('stopeat')
    .setDescription('Say to a user to stop eating')
    .addUserOption((option) =>
      option.setName('username').setDescription('The user to whom say').setRequired(true),
    ),
  execute,
};
