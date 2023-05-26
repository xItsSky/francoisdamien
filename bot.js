import {Client, Collection, Events, GatewayIntentBits, REST, Routes} from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import url from 'url';
import {config} from "./shared/config/config.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ]
});
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const commands = [];

// Bot initialization
client.on(Events.ClientReady, () => {
  console.debug(`[Initialization] Bot is up and logged in as ${client.user.tag}`);
  registerCommands().then(() => registerListeners());
});

client.login(config.token);

/**
 * Register the commands that users can use to interact with the bot
 * @returns {Promise<void>}
 */
async function registerCommands() {
  await import('./commands/moveout.command.js').then(commandFile => commands.push(commandFile.cmd));
  await import('./commands/tense.command.js').then(commandFile => commands.push(commandFile.cmd));

  // Register all commands
  console.debug(`[Commands] Starting registering ${commands.length} commands ...`);
  const rest = new REST({version: '10'}).setToken(config.token);
  await rest.put(Routes.applicationCommands(config.clientId), {body: commands.map(cmd => cmd.data.toJSON())})
    .then(data => {
      console.debug(`[Commands] Successfully registering ${data.length} commands`);
    });
}

/**
 * Register all the listener that the bot use
 * @returns {Promise<void>}
 */
async function registerListeners() {
  // Register all listeners
  console.debug('[LISTENERS] Starting registering listeners ...');
  await import('./listeners/messages.listener.js').then(listener => listener.listenMessages(client));
  await import('./listeners/voice-state.listener.js').then(listener => listener.listenVoiceState(client));
  await import('./listeners/interactions.listener.js').then(listener => listener.listenInteractions(client, commands));
  console.debug('[LISTENERS] Successfully registering listeners ...');
}
