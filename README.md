# Francois Damiens Discord bot

<img src="https://badgen.net/badge/license/MIT/green"  alt="license badge"/>
<img src="https://badgen.net/badge/discordjs/14.11.0/purple"  alt="license badge"/>
<img src="https://badgen.net/badge/version/2.0.0/cyan"  alt="license badge"/>

## Description

This is a small discord bot which reuse the emblematic lines of Francois Damiens.
It reacts to messages and voice state changes.

## How to use it locally

- Copy the `.env.sample` file into a `.env` file and feed the `TOKEN` and `CLIENT_ID` variables by using your own bot information from the Discord development portal.
- Install FFMPEG on your compute, so that your bot will be able to use the vocal feature.
- Then run `npm run dev`

## How to deploy it

- Install FFMPEG on you deployment environment
- run `docker build -t francoisdamiens .`
- run `docker run -d --name francoisdamiens francoisdamiens`


## Author

- xItsSky
- F0Y3D

## License

Please find the MIT LICENSE here: <a href="/LICENSE">MIT LICENSE</a>
