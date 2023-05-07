export function sayMoveOut(channel, callback) {
  import('./voice-service.js').then(service => service.playSong(channel, './resources/mp3/Sors.mp3', callback))
}
