export function sayTense(channel, callback) {
  import('./voice-service.js').then(service => service.playSong(channel, './resources/mp3/Tendu.mp3', callback))
}
