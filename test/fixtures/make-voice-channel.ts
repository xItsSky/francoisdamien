import type { VoiceBasedChannel } from 'discord.js';

export function makeVoiceChannel(overrides: Partial<{
  id: string;
  guildId: string;
  name: string;
}> = {}): VoiceBasedChannel {
  const id = overrides.id ?? '111111111111111111';
  const guildId = overrides.guildId ?? '222222222222222222';
  const name = overrides.name ?? 'general-voice';
  return {
    id,
    name,
    guild: { id: guildId, voiceAdapterCreator: () => ({}) as never },
  } as unknown as VoiceBasedChannel;
}
