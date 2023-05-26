export function sayStopEating(channel, callback) {
  import('./voice-service.js').then(service => service.playSong(channel, './resources/mp3/FermeTaBouche.mp3', callback))
}
