import type { Message } from 'discord.js';
import type { Greeter } from '../services/greeter.service.js';
import type { SayNo } from '../services/say-no.service.js';

export async function handleMessageCreate(
  message: Message,
  greeter: Greeter,
  sayNo: SayNo,
): Promise<void> {
  if (message.author.bot) return;
  await Promise.all([greeter.replyToHello(message), sayNo.maybeReact(message)]);
}
