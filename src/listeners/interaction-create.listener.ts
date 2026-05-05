import type { ChatInputCommandInteraction, Interaction } from 'discord.js';
import type { SlashCommand } from '../types/slash-command.js';
import type { AppContext } from '../types/app-context.js';

export async function handleInteractionCreate(
  interaction: Interaction,
  commands: Map<string, SlashCommand>,
  ctx: AppContext,
): Promise<void> {
  if (!interaction.isChatInputCommand()) return;
  const chat = interaction as ChatInputCommandInteraction;
  const command = commands.get(chat.commandName);
  if (!command) {
    await chat.reply({ content: `Unknown command: ${chat.commandName}`, ephemeral: true });
    return;
  }
  try {
    await command.execute(chat, ctx);
  } catch (err) {
    ctx.logger.error(
      { err, commandName: chat.commandName, userId: chat.user.id, guildId: chat.guildId },
      'slash command failed',
    );
    const payload = {
      content: 'Something went wrong while running this command.',
      ephemeral: true,
    } as const;
    if (chat.replied || chat.deferred) {
      await chat.followUp(payload);
    } else {
      await chat.reply(payload);
    }
  }
}
