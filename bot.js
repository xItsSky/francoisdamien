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

  // Get all Commands from commands folder
  const commandsFolderPath = path.join(__dirname, 'commands');
  const commandsFolder = fs.readdirSync(commandsFolderPath);

  // Generating command list
  commandsFolder.forEach(commandFileName => {
    import(path.join(commandsFolderPath, commandFileName)).then(commandFile => {
      const command = commandFile.cmd;
      if ('data' in command && 'run' in command) {
        console.debug(`[Commands] Adding '${command.data.name}' command to registering process.`)
        commands.push(command);
      }

      try {
        console.debug(`[Commands] Starting registering ${commands.length} commands ...`);

        // Register all commands
        const rest = new REST({version: '10'}).setToken(config.token);
        rest.put(Routes.applicationGuildCommands(config.clientId, '910130772999024711'), {body: commands.map(cmd => cmd.data.toJSON())})
          .then(data => {
            console.debug(`[Commands] Successfully registering ${data.length} commands`);

            // Register all listeners
            console.debug('[LISTENERS] Starting registering listeners ...');
            import('./listeners/messages.listener.js').then(listener => listener.listenMessages(client));
            import('./listeners/voice-state.listener.js').then(listener => listener.listenVoiceState(client));
            import('./listeners/interactions.listener.js').then(listener => listener.listenInteractions(client, commands));
            console.debug('[LISTENERS] Successfully registering listeners ...');
          })
      } catch (error) {
        console.error(error);
      }
    });
  });
});

client.login(config.token);
