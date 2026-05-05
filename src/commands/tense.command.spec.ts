import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cmd } from './tense.command.js';
import { makeInteraction } from '@fixtures/make-interaction.js';
import { makeVoiceChannel } from '@fixtures/make-voice-channel.js';
import { AudioId } from '../types/audio.js';

const voice = { joinAndPlay: vi.fn() };
const ctx = {
  config: {} as never,
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  voice: voice as never,
};

describe('/tense command', () => {
  beforeEach(() => voice.joinAndPlay.mockReset());

  it('declares the username option as required', () => {
    const json = cmd.data.toJSON();
    expect(json.name).toBe('tense');
    expect(json.options?.[0]?.required).toBe(true);
  });

  it('plays Tense audio in the target user channel', async () => {
    voice.joinAndPlay.mockResolvedValue(undefined);
    const channel = makeVoiceChannel();
    const { interaction } = makeInteraction({
      targetMember: { displayName: 'bob', voice: { channel, disconnect: vi.fn() } },
    });
    await cmd.execute(interaction, ctx);
    expect(voice.joinAndPlay).toHaveBeenCalledWith(channel, AudioId.Tense);
  });

  it('replies ephemerally when the target is not in a voice channel', async () => {
    const { interaction, reply } = makeInteraction({
      targetMember: { displayName: 'bob', voice: { channel: null, disconnect: vi.fn() } },
    });
    await cmd.execute(interaction, ctx);
    expect(reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
    expect(voice.joinAndPlay).not.toHaveBeenCalled();
  });
});
