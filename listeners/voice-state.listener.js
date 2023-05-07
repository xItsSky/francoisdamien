import {Events} from 'discord.js';

export function listenVoiceState(client) {
  client.on(Events.VoiceStateUpdate, (previousState, currentState) => {

    // Ignoring when this bot is joining a vocal
    if(client.user.id === currentState.member.id) {
      return;
    }

    // Managing joining event
    if(previousState.channelId === null) {
      console.debug(`[JOINING EVENT] ${currentState.member.displayName} has join the channel ${currentState.channel.name}`);
      import('../services/hello-voice.service.js').then(service => service.sayHello(currentState.channel));
    }
  });
}
