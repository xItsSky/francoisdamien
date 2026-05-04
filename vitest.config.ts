import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    environment: 'node',
    globals: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/main.ts',
        'src/bot.ts',
        'src/logger.ts',
        'src/commands/index.ts',
        'src/listeners/index.ts',
        'src/types/**',
        'src/**/*.spec.ts',
      ],
      thresholds: { lines: 70, branches: 70, functions: 70, statements: 70 },
    },
  },
});
