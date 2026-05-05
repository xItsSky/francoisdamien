import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioId } from '../types/audio.js';

vi.mock('node:fs', () => ({
  statSync: vi.fn(),
}));

import { statSync } from 'node:fs';
import { buildAudioCatalog } from './audio.catalog.js';

const mockedStatSync = vi.mocked(statSync);

describe('buildAudioCatalog', () => {
  beforeEach(() => {
    mockedStatSync.mockReset();
    mockedStatSync.mockImplementation(() => ({ isFile: () => true }) as never);
  });

  it('resolves every AudioId to an absolute mp3 path', () => {
    const catalog = buildAudioCatalog();
    const ids = Object.values(AudioId);
    for (const id of ids) {
      const p = catalog.getPath(id);
      expect(p.endsWith('.mp3')).toBe(true);
      expect(p.startsWith('/')).toBe(true);
    }
  });

  it('throws at boot when an MP3 file is missing', () => {
    mockedStatSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });
    expect(() => buildAudioCatalog()).toThrow(/audio asset/i);
  });

  it('throws when a path exists but is not a regular file', () => {
    mockedStatSync.mockImplementation(() => ({ isFile: () => false }) as never);
    expect(() => buildAudioCatalog()).toThrow(/audio asset/i);
  });
});
