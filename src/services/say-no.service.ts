import type { Message } from 'discord.js';
import { AudioId } from '../types/audio.js';
import type { VoiceService } from './voice.service.js';

export interface SayNo {
  maybeReact(message: Message): Promise<void>;
}

export function buildSayNo(noWords: string[], voice: VoiceService): SayNo {
  const lowered = noWords.map((w) => w.toLowerCase());
  return {
    async maybeReact(message) {
      const channel = message.member?.voice.channel;
      if (!channel) return;
      const words = message.content.toLowerCase().split(/\s+/);
      if (!lowered.some((word) => words.includes(word))) return;
      await voice.joinAndPlay(channel, AudioId.No);
    },
  };
}
