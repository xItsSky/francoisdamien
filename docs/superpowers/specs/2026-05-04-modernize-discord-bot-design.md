# Modernize the François Damiens Discord bot

**Status:** Approved
**Date:** 2026-05-04
**Owner:** xItsSky

## Goal

Modernize the existing Discord bot end-to-end: drop abandoned and bogus
dependencies, eliminate known and reported vulnerabilities, migrate the codebase
to TypeScript, restructure modules for testability, and add a real test suite.
Behavior is preserved (same three slash commands, same two message listeners,
same voice-join greeter, same five MP3 audio responses) except for one
deliberate bug fix: slash commands now act on the user passed as the `username`
option instead of the caller.

## Non-goals

- Adding new commands, audio lines, or features.
- Changing the bot's Discord identity, OAuth scopes, or permission model beyond
  the minimum needed for correctness.
- Replacing discord.js with another framework (e.g. Sapphire).
- Adopting a runtime DI container.

## Current state

- Node.js (ESM) bot using `discord.js@14.11.0`, `@discordjs/voice@0.16.0`.
- Dependencies include the abandoned `sodium@3.0.2`, the placeholder `ffmpeg@0.0.4`
  npm package, and an `opusscript` build that lags upstream.
- `env-cmd` and `nodemon` are referenced in scripts but not declared as
  devDependencies, breaking reproducible installs.
- Heavy use of dynamic `import()` for modules that are always loaded; no static
  type information; no tests; no lint/format config.
- All three slash commands declare a `username` option that is never read — they
  always operate on `interaction.member`.
- `voice-service.js` joins a voice channel without waiting for `Ready`, relies
  on a `stateChange → idle` listener to disconnect, and uses `disconnect()`
  rather than `destroy()`, leaking reconnect loops.
- `Configuration` accepts `undefined` env values silently; `process.env.NO_WORDS`
  and `process.env.HELLO_WORDS` are read directly inside services.
- Dockerfile uses `node:18.16.0`, installs npm and `env-cmd` globally, and runs
  as root.

## Decisions

- **Aggressive modernization (Approach C from brainstorming):** TypeScript,
  tests, restructured services.
- **Lightweight modular architecture (Approach 1 from brainstorming):** keep
  the existing `commands/` / `listeners/` / `services/` shape, no DI container,
  no framework migration.
- **Runtime:** Node 22 LTS, ESM (`"module": "NodeNext"`).
- **Test framework:** Vitest with `@vitest/coverage-v8`.
- **Lint/format:** ESLint flat config + `typescript-eslint` + Prettier.
- **Validation:** Zod for environment configuration.
- **Logging:** `pino` (with `pino-pretty` in dev only).
- **Voice deps:** drop `sodium` and the bogus `ffmpeg` npm package; add
  `libsodium-wrappers`, `ffmpeg-static`, and `@discordjs/opus`. Drop `opusscript`.
- **Slash commands act on the `username` option** (declared bug fix).
- **No `nodemon`, no `env-cmd`:** use `tsx watch` for dev and Node 22's native
  `--env-file` flag for env loading.

## Target project layout

```
francoisdamien/
├─ src/
│  ├─ main.ts                                 # entry: load config, build bot, login, signals
│  ├─ bot.ts                                  # buildClient(): Client with intents
│  ├─ logger.ts                               # pino instance
│  ├─ config/
│  │   ├─ env.ts                              # Zod schema → typed Config
│  │   └─ keywords.ts                         # parses HELLO_WORDS / NO_WORDS
│  ├─ commands/
│  │   ├─ index.ts                            # loadCommands(), publishSlashCommands()
│  │   ├─ moveout.command.ts
│  │   ├─ stop-eat.command.ts
│  │   └─ tense.command.ts
│  ├─ listeners/
│  │   ├─ index.ts                            # registerListeners(client, ctx, commands)
│  │   ├─ interaction-create.listener.ts
│  │   ├─ message-create.listener.ts
│  │   └─ voice-state-update.listener.ts
│  ├─ services/
│  │   ├─ voice.service.ts                    # joinAndPlay(channel, audioId)
│  │   ├─ audio.catalog.ts                    # AudioId → resolved absolute paths
│  │   └─ greeter.service.ts                  # text reply for hello words
│  └─ types/
│      ├─ slash-command.ts                    # SlashCommand interface
│      └─ app-context.ts                      # { config, logger, voice }
├─ test/fixtures/
│  ├─ make-interaction.ts
│  ├─ make-message.ts
│  ├─ make-voice-state.ts
│  └─ make-voice-channel.ts
├─ resources/mp3/                             # unchanged
├─ tsconfig.json
├─ vitest.config.ts
├─ eslint.config.js
├─ .prettierrc.json
├─ .nvmrc                                     # 22
├─ .env.sample
├─ Dockerfile                                 # multistage, non-root
├─ package.json
└─ README.md
```

## Components

### Config (`src/config/env.ts`, `src/config/keywords.ts`)

```ts
const EnvSchema = z.object({
  TOKEN: z.string().min(1),
  CLIENT_ID: z.string().regex(/^\d{17,20}$/),
  HELLO_WORDS: z.string().min(1),
  NO_WORDS: z.string().min(1),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),
});

export type Config = {
  token: string;
  clientId: string;
  helloWords: string[];
  noWords: string[];
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config;
```

`loadConfig` is called exactly once from `main.ts`. Validation failure throws
with a friendly aggregated message and the process exits before `client.login`.

`keywords.ts` exposes `parseKeywords(raw: string): string[]` — split on `,`,
`trim`, `toLowerCase`, drop empties.

### Slash command contract (`src/types/slash-command.ts`)

```ts
export interface SlashCommand {
  data: SlashCommandBuilder;
  execute(
    interaction: ChatInputCommandInteraction,
    ctx: AppContext,
  ): Promise<void>;
}
```

`AppContext = { config: Config; logger: Logger; voice: VoiceService }`. Passed
explicitly into commands and listeners — no global state, no dynamic `import()`.

### Command registry (`src/commands/index.ts`)

- `loadCommands(): Map<string, SlashCommand>` — explicit static imports of the
  three command modules, returns a `Map` keyed by `command.data.name`.
- `publishSlashCommands(rest, clientId, commands): Promise<void>` — issues
  `PUT applicationCommands` once at startup with the JSON bodies.

### Commands (target-user resolution + voice play)

Each command resolves the target user from the `username` option:

```ts
const targetUser = interaction.options.getUser('username', true);
if (!interaction.guild) {
  return interaction.reply({ content: '…', ephemeral: true });
}
const targetMember = await interaction.guild.members.fetch(targetUser.id);
const channel = targetMember.voice.channel;
if (!channel) {
  return interaction.reply({
    content: `Cannot reach ${targetMember.displayName}, they are not in a voice channel.`,
    ephemeral: true,
  });
}
await interaction.reply({ content: `…`, ephemeral: false });
await ctx.voice.joinAndPlay(channel, AudioId.X);
// /moveout only:
await targetMember.voice.disconnect();
```

`/moveout` uses `setDefaultMemberPermissions(MoveMembers)` (changed from the
incorrect `KickMembers`). On `DiscordAPIError` code `50013` (Missing
Permissions) the listener replies ephemerally with a friendly message.

### Listener registry (`src/listeners/index.ts`)

`registerListeners(client, ctx, commands)` wires three explicit handlers via
`client.on(Events.X, …)`. Each handler module accepts dependencies as arguments
so the modules are unit-testable in isolation.

`interaction-create.listener.ts` performs the lookup, runs `safeExecute`, and
on unknown command replies ephemerally.

`message-create.listener.ts` ignores bot messages, forwards to
`greeter.service.replyToHello(message, ctx)` and to a small `say-no` handler
that triggers `voice.joinAndPlay` when a no-word matches and the author is in a
voice channel.

`voice-state-update.listener.ts` ignores the bot's own updates and triggers
`hello` audio when `oldState.channelId === null && newState.channelId !== null`.

### VoiceService (`src/services/voice.service.ts`)

```ts
class VoiceService {
  async joinAndPlay(channel: VoiceBasedChannel, audioId: AudioId): Promise<void>;
}
```

Internals:

1. `joinVoiceChannel({ channelId, guildId, adapterCreator, selfDeaf: true })`.
2. `await entersState(connection, VoiceConnectionStatus.Ready, 10_000)`.
3. Build `AudioPlayer` with `behaviors: { noSubscriber: NoSubscriberBehavior.Pause }`.
4. `connection.subscribe(player); player.play(createAudioResource(path))`.
5. `await entersState(player, AudioPlayerStatus.Idle, 30_000)` — replaces the
   brittle `stateChange` callback in the legacy code.
6. `connection.destroy()` in a `finally` block, even on error.
7. `Disconnected` listener that attempts a single recovery via
   `entersState(Signalling | Connecting, 5_000)`, otherwise `destroy()`.

### Audio catalog (`src/services/audio.catalog.ts`)

At boot, resolves each `AudioId` to an absolute path under `resources/mp3/`,
calls `fs.statSync` to fail fast if any file is missing. Exposes:

```ts
export enum AudioId { Hello, MoveOut, StopEating, Tense, No }
export function getAudioPath(id: AudioId): string;
```

### Logger (`src/logger.ts`)

`pino({ level: config.logLevel })`. In dev, attaches a `pino-pretty` transport.
`AppContext.logger` is the same instance.

## Error handling

- Per-interaction: `safeExecute` wraps `command.execute`. Catches all errors,
  logs with `{ commandName, userId, guildId }`, replies ephemerally with a
  generic error message via `interaction.reply` or `interaction.followUp`
  depending on `interaction.replied / deferred`.
- Top-level (`main.ts`):
  - `process.on('unhandledRejection', logAndContinue)`
  - `process.on('uncaughtException', logAndExit)` — Node 22 best practice.
  - `client.on('error' | 'shardError', log)`.
- Voice errors (channel ready timeout, audio ready timeout, file missing) bubble
  out of `joinAndPlay`; commands log and reply ephemerally.

## Lifecycle

- `main.ts`:
  1. `loadConfig()`
  2. `buildLogger(config)`
  3. `validateAudioCatalog()` (statSync each MP3)
  4. `loadCommands()`
  5. `client = buildClient()`
  6. `publishSlashCommands(rest, clientId, commands)` (once)
  7. `registerListeners(client, ctx, commands)`
  8. `client.login(config.token)`
- `SIGINT` / `SIGTERM`: destroy any active voice connections, `client.destroy()`,
  `logger.flush()`, `process.exit(0)`.

## Testing strategy

- **Framework:** Vitest, `*.spec.ts` co-located in `src/`.
- **Coverage gate:** ≥ 70% lines and branches via `vitest.config.ts`
  thresholds.
- **Unit tests** (mocking `@discordjs/voice` and `node:fs` where needed):
  - `config/env.ts`: valid input, missing fields, malformed `CLIENT_ID`,
    `LOG_LEVEL` defaulting.
  - `config/keywords.ts`: empty, trailing comma, mixed case.
  - `services/greeter.service.ts`: match, no-match, case-insensitive.
  - `services/audio.catalog.ts`: all IDs resolve, missing file throws at boot.
  - `services/voice.service.ts`: connection destroyed on success, on play
    error, on entersState timeout; `selfDeaf: true` asserted.
  - `commands/*.command.ts`: target-user resolution from option, ephemeral
    reply when no voice channel, `voice.joinAndPlay` called with correct
    `AudioId`, `/moveout` calls `disconnect()` only after play resolves.
  - `listeners/interaction-create.listener.ts`: unknown command path,
    thrown-error path.
  - `listeners/message-create.listener.ts`: bot messages skipped, hello reply,
    no-word path requires member in voice.
  - `listeners/voice-state-update.listener.ts`: bot's own update skipped,
    join event triggers hello, channel-switch ignored.
- **Not tested:** `main.ts` startup wiring, `bot.ts`, the actual REST
  `applicationCommands` PUT.
- **CI / pre-commit:** `npm test` runs `vitest run --coverage`,
  `npm run typecheck` runs `tsc --noEmit`, `npm run lint` runs ESLint. All three
  must pass before a commit.

## Dependencies

**Removed:** `sodium`, `ffmpeg` (the placeholder package), `opusscript`,
`env-cmd`, `nodemon`.

**Upgraded:** `discord.js@^14.16`, `@discordjs/voice@^0.18`.

**Added (runtime):** `libsodium-wrappers`, `ffmpeg-static`, `@discordjs/opus`,
`pino`, `zod`.

**Added (dev):** `typescript`, `tsx`, `vitest`, `@vitest/coverage-v8`,
`eslint`, `typescript-eslint`, `prettier`, `eslint-config-prettier`,
`@types/node`, `pino-pretty`.

`@discordjs/opus` requires a C++ toolchain at install time. The Dockerfile
build stage installs `build-essential` and `python3` for that step only; the
runtime image stays slim.

## Dockerfile

Multistage build:

```dockerfile
FROM node:22-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential python3 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY resources ./resources
USER node
CMD ["node", "--env-file=.env", "dist/main.js"]
```

`ffmpeg-static` ships a Linux binary in `node_modules` that `prism-media`
auto-resolves, so no system `ffmpeg` install is needed in the runtime image.

## package.json scripts

```json
{
  "type": "module",
  "engines": { "node": ">=22.0.0" },
  "scripts": {
    "dev": "tsx watch --env-file=.env src/main.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node --env-file=.env dist/main.js",
    "test": "vitest run --coverage",
    "test:watch": "vitest",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

## Documentation updates

- `README.md` rewritten to cover Node 22 prerequisite, `npm run dev`/`build`/
  `start`/`test`, the new `username`-targeting behavior, and the fact that
  `ffmpeg-static` removes the local-ffmpeg install requirement on every
  platform (the bundled binary is auto-resolved by `prism-media`).
- `.env.sample` extended with `HELLO_WORDS` and `NO_WORDS` examples and
  `LOG_LEVEL`.
- Stale `version/1.0.0` badge removed; `discordjs` badge bumped.

## Migration order

1. Branch `chore/modernize-bot`.
2. Add tooling scaffolding: `tsconfig.json`, `eslint.config.js`,
   `.prettierrc.json`, `vitest.config.ts`, `.nvmrc`, `.gitignore` tweaks.
3. Rewrite `package.json` (deps, devDeps, scripts, engines); first install.
4. Port modules in dependency order, deleting each old `.js` in the same
   commit that introduces its TS replacement (no parallel old/new tree):
   `config` → `logger` → `audio.catalog` → `voice.service` → other services
   → commands → listeners → `bot.ts` → `main.ts`.
5. Add tests alongside each module (TDD per global convention).
6. Rewrite Dockerfile; manual `docker build` smoke test locally.
7. Update README and `.env.sample`.
8. Final `npm run lint && npm test && npm run build` green.
9. Open a single PR with conventional commits.

## Risks and mitigations

- **`@discordjs/opus` native build fails on the build host.** Mitigation: the
  Dockerfile build stage installs the toolchain. Fallback: replace with
  `opusscript` if a deployment target cannot run native modules — would be a
  one-line `package.json` swap and one `import` change in `voice.service.ts`.
- **`selfDeaf: true` is new behavior.** The bot does not consume incoming
  audio today, so this should be invisible. Documented for future readers.
- **`MessageContent` privileged intent unchanged.** Required for the hello/no
  listeners we agreed to keep.
- **Coverage gate may fail on first run.** The 70% threshold is a hard gate
  — if a port lands without enough tests the implementation step blocks until
  tests are added rather than lowering the threshold.
