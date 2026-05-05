import { Events } from 'discord.js';
import { loadConfig } from './config/env.js';
import { buildLogger } from './logger.js';
import { buildAudioCatalog } from './services/audio.catalog.js';
import { buildVoiceService } from './services/voice.service.js';
import { loadCommands, publishSlashCommands } from './commands/index.js';
import { registerListeners } from './listeners/index.js';
import { buildClient } from './bot.js';
import type { AppContext } from './types/app-context.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = buildLogger(config.logLevel);

  process.on('unhandledRejection', (err) => logger.error({ err }, 'unhandledRejection'));
  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'uncaughtException');
    process.exit(1);
  });

  const catalog = buildAudioCatalog();
  const voice = buildVoiceService(catalog, logger);
  const commands = loadCommands();
  const ctx: AppContext = { config, logger, voice };

  const client = buildClient();
  client.on('error', (err) => logger.error({ err }, 'client error'));
  client.on('shardError', (err) => logger.error({ err }, 'shard error'));

  client.once(Events.ClientReady, async () => {
    logger.info({ tag: client.user?.tag }, 'bot ready');
    await publishSlashCommands(config.token, config.clientId, commands, logger);
    registerListeners(client, ctx, commands);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'shutting down');
    try {
      client.destroy();
    } catch (err) {
      logger.warn({ err }, 'error during client.destroy');
    }
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  await client.login(config.token);
}

void main();
