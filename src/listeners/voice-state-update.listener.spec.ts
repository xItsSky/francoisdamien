import { describe, it, expect, vi } from 'vitest';
import { handleVoiceStateUpdate } from './voice-state-update.listener.js';
import { makeVoiceState } from '@fixtures/make-voice-state.js';
import { AudioId } from '../types/audio.js';

const voice = { joinAndPlay: vi.fn().mockResolvedValue(undefined) };
const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };

const BOT_ID = 'BOT_USER_ID';

describe('handleVoiceStateUpdate', () => {
  it('plays Hello when a member joins (channelId: null → set)', async () => {
    voice.joinAndPlay.mockReset();
    const previous = makeVoiceState({ memberId: '333333333333333333', channelId: null });
    const current = makeVoiceState({
      memberId: '333333333333333333',
      channelId: '111111111111111111',
    });
    await handleVoiceStateUpdate(previous, current, BOT_ID, voice as never, logger as never);
    expect(voice.joinAndPlay).toHaveBeenCalledWith(current.channel, AudioId.Hello);
  });

  it('ignores its own bot transitions', async () => {
    voice.joinAndPlay.mockReset();
    const previous = makeVoiceState({ memberId: BOT_ID, channelId: null });
    const current = makeVoiceState({ memberId: BOT_ID, channelId: '111111111111111111' });
    await handleVoiceStateUpdate(previous, current, BOT_ID, voice as never, logger as never);
    expect(voice.joinAndPlay).not.toHaveBeenCalled();
  });

  it('ignores channel-to-channel switches', async () => {
    voice.joinAndPlay.mockReset();
    const previous = makeVoiceState({
      memberId: '333333333333333333',
      channelId: '999999999999999999',
    });
    const current = makeVoiceState({
      memberId: '333333333333333333',
      channelId: '111111111111111111',
    });
    await handleVoiceStateUpdate(previous, current, BOT_ID, voice as never, logger as never);
    expect(voice.joinAndPlay).not.toHaveBeenCalled();
  });
});
