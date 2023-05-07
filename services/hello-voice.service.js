export function sayHello(channel) {
  import('./voice-service.js').then(service => service.playSong(channel, './resources/mp3/Bonjour.mp3'))
}
