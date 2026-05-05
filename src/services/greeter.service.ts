import type { Message } from 'discord.js';

export interface Greeter {
  replyToHello(message: Message): Promise<void>;
}

export function buildGreeter(helloWords: string[]): Greeter {
  const lowered = helloWords.map((w) => w.toLowerCase());
  return {
    async replyToHello(message) {
      const content = message.content.toLowerCase();
      if (lowered.some((word) => content.includes(word))) {
        await message.reply(`Ces m'sieurs dames, booonjour !`);
      }
    },
  };
}
