export function sayNo(message) {
  const noWords = process.env.NO_WORDS.split(',').map(word => word.toLowerCase());
  const messageWords = message.content.toLowerCase().split(' ');
  const channel = message.member.voice.channel;

  if(noWords.some(word => messageWords.includes(word)) && channel !== null) {
    import('./voice-service.js').then(service => service.playSong(channel, './resources/mp3/Non.mp3'));
  }
}
