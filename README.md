# François Damiens Discord bot

[![license](https://badgen.net/badge/license/MIT/green)](LICENSE)
[![discord.js](https://badgen.net/badge/discord.js/14.16/purple)](https://discord.js.org/)
[![node](https://badgen.net/badge/node/22.x/cyan)](https://nodejs.org/)

A small Discord bot that replays emblematic François Damiens lines. Reacts to
slash commands, text messages, and voice-state changes.

Invite link: <https://discord.com/api/oauth2/authorize?client_id=849312964472209438&permissions=35568837864768&scope=bot>

## Commands

| Command | Effect |
|---|---|
| `/moveout @user` | Plays "Sors !" in the user's voice channel and moves them out. |
| `/stopeat @user` | Plays "Ferme ta bouche" in the user's voice channel. |
| `/tense @user`   | Plays "Tendu" in the user's voice channel. |

The bot also responds to text messages containing any of the configured
`HELLO_WORDS` and to messages containing any `NO_WORDS` (when the author is in
a voice channel), and greets new members joining a voice channel.

## Local development

Requires Node 22 (`nvm use` will pick it up from `.nvmrc`). No system FFmpeg
needed — `ffmpeg-static` ships the binary.

```bash
cp .env.sample .env   # then fill TOKEN and CLIENT_ID
npm install
npm run dev
```

Useful scripts:

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm test            # vitest run --coverage
npm run build       # emit dist/
npm start           # run compiled dist/main.js
```

## Production deployment

```bash
docker build -t francoisdamiens .
docker run -d --name francoisdamiens --env-file .env francoisdamiens
```

The image is a multistage `node:22-bookworm-slim` build, runs as the `node`
user, and bundles `ffmpeg-static` so no system FFmpeg install is required.

## Authors

- xItsSky
- F0Y3D

## License

MIT — see [LICENSE](LICENSE).
