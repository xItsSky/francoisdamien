import type { VoiceState } from 'discord.js';
import type { VoiceService } from '../services/voice.service.js';
import type { AppLogger } from '../logger.js';
import { AudioId } from '../types/audio.js';

export async function handleVoiceStateUpdate(
  previous: VoiceState,
  current: VoiceState,
  botUserId: string,
  voice: VoiceService,
  logger: AppLogger,
): Promise<void> {
  if (current.member?.id === botUserId) return;
  if (previous.channelId !== null) return;
  const channel = current.channel;
  if (!channel) return;
  logger.debug(
    { member: current.member?.displayName, channel: channel.name },
    'voice channel join detected',
  );
  await voice.joinAndPlay(channel, AudioId.Hello);
}
