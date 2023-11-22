mob-radio: Discord Music Bot

Description

mob-radio is a Discord music bot designed to play YouTube songs directly in your Discord server's voice channels. Simple and easy to use, it accepts a range of commands to play music, manage queues, and more.

Features

Play Music: Stream music from YouTube directly into Discord voice channels.
Song Queue: Manage and view upcoming songs.
Skip Tracks: Easily skip to the next song in the queue.
Leave Channel: Disconnect the bot and clear the current song queue.
Commands

Use these commands with the prefix $:

$play or $p [song/URL]: Plays a YouTube song by search or URL.
$skip or $s: Skips the current song.
$q: Shows the ongoing song queue.
$leave or $dc: Disconnects the bot and clears the song queue.
$help: Shows this help guide.
Setup

To set up mob-radio in your Discord server, follow these steps:

Clone the repository:
bash
Copy code
git clone https://github.com/wakeupaj/mob-radio.git
Install dependencies:
Copy code
npm install
Configure the bot by setting up the config.json with your Discord bot token and other relevant settings.
Run the bot:
Copy code
node bot.js
Dependencies

discord.js
@discordjs/voice
ytdl-core
ytsr
valid-url
Support and Contribution

For bug reports or suggestions, DM @wakeupaj on Discord. Your feedback is much appreciated!

Acknowledgments

Powered by 🌟GLOSTARS®.

