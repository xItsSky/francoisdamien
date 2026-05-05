import type { VoiceState } from 'discord.js';

export interface FakeVoiceStateOptions {
  memberId?: string;
  channelId?: string | null;
  channelName?: string;
  displayName?: string;
}

export function makeVoiceState(opts: FakeVoiceStateOptions = {}): VoiceState {
  const channelId = opts.channelId ?? null;
  return {
    channelId,
    channel: channelId === null ? null : { id: channelId, name: opts.channelName ?? 'voice', guild: { id: '222222222222222222', voiceAdapterCreator: () => ({}) as never } },
    member: { id: opts.memberId ?? '333333333333333333', displayName: opts.displayName ?? 'bob' },
  } as unknown as VoiceState;
}
