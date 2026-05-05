import {
  AudioPlayerStatus,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
  type VoiceConnection,
} from '@discordjs/voice';
import type { VoiceBasedChannel } from 'discord.js';
import type { AppLogger } from '../logger.js';
import type { AudioCatalog } from './audio.catalog.js';
import type { AudioId } from '../types/audio.js';

const READY_TIMEOUT_MS = 10_000;
const IDLE_TIMEOUT_MS = 30_000;
const RECONNECT_TIMEOUT_MS = 5_000;

export interface VoiceService {
  joinAndPlay(channel: VoiceBasedChannel, audioId: AudioId): Promise<void>;
}

export function buildVoiceService(catalog: AudioCatalog, logger: AppLogger): VoiceService {
  return {
    async joinAndPlay(channel, audioId) {
      const path = catalog.getPath(audioId);
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: true,
      });

      attachReconnectGuard(connection, logger);

      try {
        await entersState(connection, VoiceConnectionStatus.Ready, READY_TIMEOUT_MS);
        const player = createAudioPlayer({
          behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
        });
        connection.subscribe(player);
        player.play(createAudioResource(path));
        await entersState(player, AudioPlayerStatus.Idle, IDLE_TIMEOUT_MS);
      } finally {
        connection.destroy();
      }
    },
  };
}

async function recover(connection: VoiceConnection, logger: AppLogger): Promise<void> {
  try {
    await Promise.race([
      entersState(connection, VoiceConnectionStatus.Signalling, RECONNECT_TIMEOUT_MS),
      entersState(connection, VoiceConnectionStatus.Connecting, RECONNECT_TIMEOUT_MS),
    ]);
  } catch (err) {
    logger.warn({ err }, 'voice connection lost; destroying');
    connection.destroy();
  }
}

function attachReconnectGuard(connection: VoiceConnection, logger: AppLogger): void {
  connection.on(VoiceConnectionStatus.Disconnected, () => {
    void recover(connection, logger);
  });
}
