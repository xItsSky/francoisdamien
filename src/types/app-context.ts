import type { Config } from '../config/env.js';
import type { AppLogger } from '../logger.js';
import type { VoiceService } from '../services/voice.service.js';

export interface AppContext {
  config: Config;
  logger: AppLogger;
  voice: VoiceService;
}
