import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cmd } from './moveout.command.js';
import { makeInteraction } from '@fixtures/make-interaction.js';
import { makeVoiceChannel } from '@fixtures/make-voice-channel.js';
import { AudioId } from '../types/audio.js';

const voice = { joinAndPlay: vi.fn() };
const ctx = {
  config: {} as never,
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
  voice: voice as never,
};

describe('/moveout command', () => {
  beforeEach(() => voice.joinAndPlay.mockReset());

  it('exposes the expected slash command metadata', () => {
    const json = cmd.data.toJSON();
    expect(json.name).toBe('moveout');
    expect(json.options?.[0]?.name).toBe('username');
    expect(json.options?.[0]?.required).toBe(true);
  });

  it('replies ephemerally when the target user is not in a voice channel', async () => {
    const channel = null;
    const { interaction, reply, member } = makeInteraction({
      targetMember: { displayName: 'bob', voice: { channel, disconnect: vi.fn() } },
    });
    await cmd.execute(interaction, ctx);
    expect(reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
    expect(voice.joinAndPlay).not.toHaveBeenCalled();
    expect(member.voice?.disconnect).not.toHaveBeenCalled();
  });

  it('plays MoveOut audio in the target user channel and then disconnects them', async () => {
    voice.joinAndPlay.mockResolvedValue(undefined);
    const channel = makeVoiceChannel();
    const disconnect = vi.fn().mockResolvedValue(null);
    const { interaction, reply } = makeInteraction({
      targetMember: { displayName: 'bob', voice: { channel, disconnect } },
    });
    await cmd.execute(interaction, ctx);
    expect(reply).toHaveBeenCalledWith(
      expect.objectContaining({ content: expect.stringContaining('bob') }),
    );
    expect(voice.joinAndPlay).toHaveBeenCalledWith(channel, AudioId.MoveOut);
    expect(disconnect).toHaveBeenCalled();
    const playOrder = voice.joinAndPlay.mock.invocationCallOrder[0];
    const disconnectOrder = disconnect.mock.invocationCallOrder[0];
    expect(playOrder).toBeDefined();
    expect(disconnectOrder).toBeDefined();
    expect(playOrder!).toBeLessThan(disconnectOrder!);
  });

  it('replies ephemerally when used in a DM (no guild)', async () => {
    const { interaction, reply } = makeInteraction({ guildId: null });
    await cmd.execute(interaction, ctx);
    expect(reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
    expect(voice.joinAndPlay).not.toHaveBeenCalled();
  });
});
