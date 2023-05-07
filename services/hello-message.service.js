export function replyToHello(message) {
  const helloWords = process.env.HELLO_WORDS.split(',').map(word => word.toLowerCase());

  // Replying if message contains a hello word
  if (helloWords.some(word => message.content.toLowerCase().includes(word))) {
    message.reply(`Ces m'sieurs dames, booonjour !`);
  }
}
