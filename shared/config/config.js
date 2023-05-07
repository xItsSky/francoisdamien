export class Configuration {
  constructor(token, clientId, helloWords, noWords) {
    this.token = token;
    this.clientId = clientId;
    this.helloWords = helloWords;
    this.noWords = noWords;
  }
}
export const config = new Configuration(
  process.env.TOKEN,
  process.env.CLIENT_ID,
  process.env.HELLO_WORDS,
  process.env.NO_WORDS)
;
