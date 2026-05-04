import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import { AudioId } from '../types/audio.js';

const FILE_NAMES: Record<AudioId, string> = {
  [AudioId.Hello]: 'Bonjour.mp3',
  [AudioId.MoveOut]: 'Sors.mp3',
  [AudioId.StopEating]: 'FermeTaBouche.mp3',
  [AudioId.Tense]: 'Tendu.mp3',
  [AudioId.No]: 'Non.mp3',
};

export interface AudioCatalog {
  getPath(id: AudioId): string;
}

export function buildAudioCatalog(rootDir: string = process.cwd()): AudioCatalog {
  const paths = new Map<AudioId, string>();
  for (const id of Object.values(AudioId)) {
    const fileName = FILE_NAMES[id];
    const absolute = resolve(rootDir, 'resources', 'mp3', fileName);
    let stats;
    try {
      stats = statSync(absolute);
    } catch (err) {
      throw new Error(`Missing audio asset for ${id} at ${absolute}: ${(err as Error).message}`);
    }
    if (!stats.isFile()) {
      throw new Error(`Audio asset for ${id} at ${absolute} is not a regular file`);
    }
    paths.set(id, absolute);
  }
  return {
    getPath(id) {
      const p = paths.get(id);
      if (!p) {
        throw new Error(`Unknown audio id: ${id}`);
      }
      return p;
    },
  };
}
