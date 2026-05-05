import { describe, it, expect, vi } from 'vitest';
import { buildSayNo } from './say-no.service.js';
import { makeMessage } from '@fixtures/make-message.js';
import { makeVoiceChannel } from '@fixtures/make-voice-channel.js';
import { AudioId } from '../types/audio.js';

const voice = { joinAndPlay: vi.fn().mockResolvedValue(undefined) };

describe('sayNo.maybeReact', () => {
  it('plays Non.mp3 when a no-word matches and the author is in voice', async () => {
    voice.joinAndPlay.mockClear();
    const channel = makeVoiceChannel();
    const sayNo = buildSayNo(['no', 'nope'], voice as never);
    const { message } = makeMessage({ content: 'no way!', voiceChannel: channel });
    await sayNo.maybeReact(message);
    expect(voice.joinAndPlay).toHaveBeenCalledWith(channel, AudioId.No);
  });

  it('does not play when no no-word matches', async () => {
    voice.joinAndPlay.mockClear();
    const sayNo = buildSayNo(['no'], voice as never);
    const { message } = makeMessage({ content: 'fine by me', voiceChannel: makeVoiceChannel() });
    await sayNo.maybeReact(message);
    expect(voice.joinAndPlay).not.toHaveBeenCalled();
  });

  it('does not play when the author is not in a voice channel', async () => {
    voice.joinAndPlay.mockClear();
    const sayNo = buildSayNo(['no'], voice as never);
    const { message } = makeMessage({ content: 'no', voiceChannel: null });
    await sayNo.maybeReact(message);
    expect(voice.joinAndPlay).not.toHaveBeenCalled();
  });

  it('does not play when the message has no member at all', async () => {
    voice.joinAndPlay.mockClear();
    const sayNo = buildSayNo(['no'], voice as never);
    const { message } = makeMessage({ content: 'no' });
    await sayNo.maybeReact(message);
    expect(voice.joinAndPlay).not.toHaveBeenCalled();
  });
});
