import {createAudioPlayer, createAudioResource, joinVoiceChannel} from '@discordjs/voice';

export async function playSong(channel, song, callback) {
  const audio = createAudioResource(song);
  const player = createAudioPlayer();
  const connection = connect(channel);

  // manage disconnection once the song is played
  player.on('stateChange', (previousState, currentState) => {
    if (currentState.status === 'idle') {
      if(callback) {
        callback();
      }
      connection.disconnect();
    }
  })

  // joining the channel and play the song
  connection.subscribe(player);
  player.play(audio);
}

function connect(channel) {
  return joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });
}
