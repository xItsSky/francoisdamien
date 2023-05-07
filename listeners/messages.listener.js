import {Events} from 'discord.js';

export function listenMessages(client) {
  client.on(Events.MessageCreate, message => {

    // Ignoring bot messages
    if(message.author.bot) {
      return
    }

    // Managing hello messages
    import('../services/hello-message.service.js')
      .then(service => service.replyToHello(message));

    // Managing messages containing no
    import('../services/no-voice-service.js')
      .then(service => service.sayNo(message));
  });
}
