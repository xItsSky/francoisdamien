import type { Message } from 'discord.js';
import { vi } from 'vitest';

export interface FakeMessageOptions {
  content?: string;
  authorIsBot?: boolean;
  voiceChannel?: unknown;
}

export function makeMessage(opts: FakeMessageOptions = {}) {
  const reply = vi.fn().mockResolvedValue(null);
  const message = {
    content: opts.content ?? '',
    author: { bot: opts.authorIsBot ?? false },
    member: opts.voiceChannel === undefined ? null : { voice: { channel: opts.voiceChannel } },
    reply,
  } as unknown as Message;
  return { message, reply };
}
