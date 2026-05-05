import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioId } from '../types/audio.js';
import { makeVoiceChannel } from '@fixtures/make-voice-channel.js';

const joinVoiceChannel = vi.fn();
const entersState = vi.fn();
const createAudioPlayer = vi.fn();
const createAudioResource = vi.fn();

vi.mock('@discordjs/voice', async () => {
  const actual = await vi.importActual<typeof import('@discordjs/voice')>('@discordjs/voice');
  return {
    ...actual,
    joinVoiceChannel: (...args: unknown[]) => joinVoiceChannel(...args),
    entersState: (...args: unknown[]) => entersState(...args),
    createAudioPlayer: (...args: unknown[]) => createAudioPlayer(...args),
    createAudioResource: (...args: unknown[]) => createAudioResource(...args),
  };
});

import { buildVoiceService } from './voice.service.js';

const fakeCatalog = {
  getPath: (id: AudioId) => `/abs/resources/mp3/${id}.mp3`,
};
const noopLogger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };

describe('VoiceService.joinAndPlay', () => {
  let connection: { subscribe: ReturnType<typeof vi.fn>; destroy: ReturnType<typeof vi.fn>; on: ReturnType<typeof vi.fn> };
  let player: { play: ReturnType<typeof vi.fn>; on: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    joinVoiceChannel.mockReset();
    entersState.mockReset();
    createAudioPlayer.mockReset();
    createAudioResource.mockReset();
    noopLogger.debug.mockReset();
    noopLogger.info.mockReset();
    noopLogger.warn.mockReset();
    noopLogger.error.mockReset();

    connection = { subscribe: vi.fn(), destroy: vi.fn(), on: vi.fn() };
    player = { play: vi.fn(), on: vi.fn(), stop: vi.fn() };
    joinVoiceChannel.mockReturnValue(connection);
    createAudioPlayer.mockReturnValue(player);
    createAudioResource.mockReturnValue({ kind: 'resource' });
    entersState.mockResolvedValue(null);
  });

  it('joins the channel with selfDeaf=true', async () => {
    const svc = buildVoiceService(fakeCatalog, noopLogger as never);
    await svc.joinAndPlay(makeVoiceChannel(), AudioId.Hello);
    expect(joinVoiceChannel).toHaveBeenCalledWith(
      expect.objectContaining({ selfDeaf: true, channelId: '111111111111111111' }),
    );
  });

  it('waits for connection ready before subscribing the player', async () => {
    const svc = buildVoiceService(fakeCatalog, noopLogger as never);
    await svc.joinAndPlay(makeVoiceChannel(), AudioId.Hello);
    const readyCallIdx = entersState.mock.invocationCallOrder[0];
    const subscribeIdx = (connection.subscribe.mock as unknown as { invocationCallOrder: number[] }).invocationCallOrder[0];
    expect(readyCallIdx).toBeDefined();
    expect(subscribeIdx).toBeDefined();
    expect(readyCallIdx!).toBeLessThan(subscribeIdx!);
  });

  it('destroys the connection after the player goes idle', async () => {
    const svc = buildVoiceService(fakeCatalog, noopLogger as never);
    await svc.joinAndPlay(makeVoiceChannel(), AudioId.Hello);
    expect(connection.destroy).toHaveBeenCalledTimes(1);
  });

  it('destroys the connection when entersState times out', async () => {
    entersState.mockRejectedValueOnce(new Error('timeout'));
    const svc = buildVoiceService(fakeCatalog, noopLogger as never);
    await expect(svc.joinAndPlay(makeVoiceChannel(), AudioId.Hello)).rejects.toThrow(/timeout/);
    expect(connection.destroy).toHaveBeenCalledTimes(1);
  });

  it('destroys the connection when the player rejects on idle wait', async () => {
    entersState
      .mockResolvedValueOnce(null) // ready
      .mockRejectedValueOnce(new Error('player stuck'));
    const svc = buildVoiceService(fakeCatalog, noopLogger as never);
    await expect(svc.joinAndPlay(makeVoiceChannel(), AudioId.Hello)).rejects.toThrow(/player stuck/);
    expect(connection.destroy).toHaveBeenCalledTimes(1);
  });

  it('uses the catalog to resolve the audio path', async () => {
    const svc = buildVoiceService(fakeCatalog, noopLogger as never);
    await svc.joinAndPlay(makeVoiceChannel(), AudioId.MoveOut);
    expect(createAudioResource).toHaveBeenCalledWith('/abs/resources/mp3/move-out.mp3');
  });
});
