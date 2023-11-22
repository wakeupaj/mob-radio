# MobRadio: Discord Music Bot 📻🎶 


## Description
`MobRadio` is a Discord music bot designed to play YouTube songs directly in your Discord server's voice channels. Simple and easy to use, it accepts a range of commands to play music, manage queues, and more. 
## Features
- **Play Music**: Stream music from YouTube directly into Discord voice channels.
- **Song Queue**: Manage and view upcoming songs.
- **Skip Tracks**: Easily skip to the next song in the queue.
- **Leave Channel**: Disconnect the bot and clear the current song queue.

## Commands
Use these commands with the prefix `$`:

- `$play` or `$p [song/URL]`: Plays a YouTube song by search or URL.
- `$skip` or `$s`: Skips the current song.
- `$q`: Shows the ongoing song queue.
- `$leave` or `$dc`: Disconnects the bot and clears the song queue.
- `$help`: Shows a comprehensive help guide.
- `$set`: Admin Exclusive Hidden command; Sets the channel that the bot will listen for commands in.

## Setup
To set up `MobRadio` in your Discord server, follow these steps:

-> [Add bot to your server](https://discord.com/oauth2/authorize?client_id=1165904123229642772&permissions=8&redirect_uri=http://localhost:53134&response_type=code&scope=bot)
-> Run `$set` 
-> Run `$help`

## Dependencies
- discord.js
- @discordjs/voice
- ytdl-core
- ytsr
- valid-url

## Support and Contribution
For bug reports or suggestions, DM @wakeupaj on Discord. Your feedback is much appreciated!

## Acknowledgments
Powered by 🌟GLOSTARS®.
