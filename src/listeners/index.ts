import { Events, type Client } from 'discord.js';
import type { SlashCommand } from '../types/slash-command.js';
import type { AppContext } from '../types/app-context.js';
import { buildGreeter } from '../services/greeter.service.js';
import { buildSayNo } from '../services/say-no.service.js';
import { handleInteractionCreate } from './interaction-create.listener.js';
import { handleMessageCreate } from './message-create.listener.js';
import { handleVoiceStateUpdate } from './voice-state-update.listener.js';

export function registerListeners(
  client: Client,
  ctx: AppContext,
  commands: Map<string, SlashCommand>,
): void {
  const greeter = buildGreeter(ctx.config.helloWords);
  const sayNo = buildSayNo(ctx.config.noWords, ctx.voice);

  client.on(Events.InteractionCreate, (interaction) => {
    void handleInteractionCreate(interaction, commands, ctx);
  });

  client.on(Events.MessageCreate, (message) => {
    void handleMessageCreate(message, greeter, sayNo);
  });

  client.on(Events.VoiceStateUpdate, (previous, current) => {
    const botId = client.user?.id;
    if (!botId) return;
    void handleVoiceStateUpdate(previous, current, botId, ctx.voice, ctx.logger);
  });
}
