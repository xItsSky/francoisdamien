import { pino, type Logger } from 'pino';
import type { LogLevel } from './config/env.js';

export type AppLogger = Logger;

export function buildLogger(level: LogLevel): AppLogger {
  const isDev = process.env.NODE_ENV !== 'production';
  return pino({
    level,
    ...(isDev
      ? {
          transport: {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'SYS:HH:MM:ss' },
          },
        }
      : {}),
  });
}
