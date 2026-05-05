import { z } from 'zod';
import { parseKeywords } from './keywords.js';

const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const;

const EnvSchema = z.object({
  TOKEN: z.string().min(1),
  CLIENT_ID: z.string().regex(/^\d{17,20}$/, 'CLIENT_ID must be a Discord snowflake'),
  HELLO_WORDS: z.string().min(1),
  NO_WORDS: z.string().min(1),
  LOG_LEVEL: z.enum(LOG_LEVELS).default('info'),
});

export type LogLevel = (typeof LOG_LEVELS)[number];

export interface Config {
  token: string;
  clientId: string;
  helloWords: string[];
  noWords: string[];
  logLevel: LogLevel;
}

export function loadConfig(env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env): Config {
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration — ${issues}`);
  }
  const data = parsed.data;
  return {
    token: data.TOKEN,
    clientId: data.CLIENT_ID,
    helloWords: parseKeywords(data.HELLO_WORDS),
    noWords: parseKeywords(data.NO_WORDS),
    logLevel: data.LOG_LEVEL,
  };
}
