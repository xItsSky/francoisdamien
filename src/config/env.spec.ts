import { describe, it, expect } from 'vitest';
import { loadConfig } from './env.js';

const baseEnv = {
  TOKEN: 'fake-token',
  CLIENT_ID: '123456789012345678',
  HELLO_WORDS: 'hello,hi',
  NO_WORDS: 'no,nope',
};

describe('loadConfig', () => {
  it('returns a typed Config when all required vars are present', () => {
    const cfg = loadConfig(baseEnv);
    expect(cfg.token).toBe('fake-token');
    expect(cfg.clientId).toBe('123456789012345678');
    expect(cfg.helloWords).toEqual(['hello', 'hi']);
    expect(cfg.noWords).toEqual(['no', 'nope']);
    expect(cfg.logLevel).toBe('info');
  });

  it('honours an explicit LOG_LEVEL', () => {
    const cfg = loadConfig({ ...baseEnv, LOG_LEVEL: 'debug' });
    expect(cfg.logLevel).toBe('debug');
  });

  it('throws when TOKEN is missing', () => {
    const { TOKEN: _t, ...rest } = baseEnv;
    expect(() => loadConfig(rest)).toThrow(/TOKEN/);
  });

  it('throws when CLIENT_ID is malformed', () => {
    expect(() => loadConfig({ ...baseEnv, CLIENT_ID: 'abc' })).toThrow(/CLIENT_ID/);
  });

  it('throws when LOG_LEVEL is not one of the allowed values', () => {
    expect(() => loadConfig({ ...baseEnv, LOG_LEVEL: 'verbose' })).toThrow(/LOG_LEVEL/);
  });
});
