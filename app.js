const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] })

const HelloService = require('./service/HelloService')(client);
const HelloAnswerService = require('./service/HelloAnswerService')(client);
const NoService = require('./service/NoService')(client);

client.login(process.env.TOKEN);
