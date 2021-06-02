const { Client, Intents } = require('discord.js');
require("./utils/InlineReply");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] })

const HelloService = require('./service/HelloService')(client);
const HelloAnswerService = require('./service/HelloAnswerService')(client);
const HelloJoinService = require('./service/HelloJoinService')(client);
const NoService = require('./service/NoService')(client);
const BeerService = require('./service/BeerService')(client);
const InsultService = require('./service/InsultService')(client);
const GoOutTextService = require('./service/GoOutTextService')(client);
const GoOutService = require('./service/GoOutService')(client);

client.login(process.env.TOKEN);
