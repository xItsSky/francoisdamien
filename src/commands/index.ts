import { REST, Routes } from 'discord.js';
import type { SlashCommand } from '../types/slash-command.js';
import type { AppLogger } from '../logger.js';
import { cmd as moveOut } from './moveout.command.js';
import { cmd as stopEat } from './stop-eat.command.js';
import { cmd as tense } from './tense.command.js';

export function loadCommands(): Map<string, SlashCommand> {
  const map = new Map<string, SlashCommand>();
  for (const command of [moveOut, stopEat, tense]) {
    map.set(command.data.name, command);
  }
  return map;
}

export async function publishSlashCommands(
  token: string,
  clientId: string,
  commands: Map<string, SlashCommand>,
  logger: AppLogger,
): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(token);
  const body = Array.from(commands.values()).map((cmd) => cmd.data.toJSON());
  logger.debug({ count: body.length }, 'publishing slash commands');
  await rest.put(Routes.applicationCommands(clientId), { body });
  logger.info({ count: body.length }, 'slash commands published');
}
