  const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
  const ytdl = require('ytdl-core');
  const ytsr = require('ytsr');
  const validUrl = require('valid-url');

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
    ]
  });

  const songQueue = [];
  let voiceConnection = null;
  let dispatcher = null;
  let designatedChannelId = null;

  // Helper function to clean up resources
  function cleanUp() {
    if (voiceConnection) {
      voiceConnection.destroy();
      voiceConnection = null;
    }
    if (dispatcher) {
      dispatcher.stop();
      dispatcher = null;
    }
  }

  // Helper function to play a song
  const playSong = async (voiceConnection, textChannel, songQueue) => {
    if (songQueue.length === 0) {
      console.log('Queue ended. Bot is ready to play more music.');
      cleanUp();
      textChannel.send('The queue is now empty. I am disconnecting from the voice channel.');
      return;
    }

    const currentSong = songQueue[0];

    try {
      const stream = ytdl(currentSong.url, { filter: 'audioonly' });
      const resource = createAudioResource(stream);
      dispatcher = createAudioPlayer();
      dispatcher.play(resource);
      voiceConnection.subscribe(dispatcher);
      dispatcher.on(AudioPlayerStatus.Idle, () => {
        songQueue.shift();
        playSong(voiceConnection, textChannel, songQueue);
      });
      dispatcher.on('error', error => {
        console.error('Error from the audio player:', error);
        songQueue.shift();
        playSong(voiceConnection, textChannel, songQueue);
      });
    } catch (error) {
      console.error('Error in playSong:', error);
      songQueue.shift();
      playSong(voiceConnection, textChannel, songQueue);
    }
  };

  client.once('ready', () => {
    console.log('Ready!');
  });

  client.on('messageCreate', async message => {
    if (!message.guild) return; // Ensure the message is in a guild
    if (designatedChannelId && message.channel.id !== designatedChannelId) return; // Ensure the message is in the designated channel if set

    console.log(`Message from ${message.author.tag} in #${message.channel.name}: ${message.content}`);


  // Help Command
  if (message.content.toLowerCase() === '$help') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#ff74aa')
      .setTitle('Help Guide')
      .setDescription('List of available commands:')
      .addFields(
        { name: '$play | $p [song/URL]', value: 'Plays a YouTube song by search or URL.' },
        { name: '$skip | $s', value: 'Skips the current song.' },
        { name: '$queue | $q', value: 'Shows the ongoing song queue.' },
        { name: '$leave | $dc', value: 'Disconnects the bot and clears the song queue.' }
      )
      .setFooter({ text: 'Use the commands with the prefix $\nDM @wakeupaj on Discord to report bugs or suggestions.\nPowered by 🌟GLOSTARS®' });

    return message.channel.send({ embeds: [helpEmbed] });
  }


  // Play Command
if (message.content.toLowerCase().startsWith('$play') || message.content.toLowerCase().startsWith('$p')) {    
    const args = message.content.split(' ').slice(1);
    const query = args.join(' ');
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.channel.send('You need to be in a voice channel to play music!');
    }

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      return message.channel.send('I need the permissions to join and speak in your voice channel!');
    }

    if (validUrl.isUri(query)) {
      if (ytdl.validateURL(query)) {
        const songInfo = await ytdl.getInfo(query);
        const song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
        };
        songQueue.push(song);

        if (!voiceConnection || voiceConnection.state.status === VoiceConnectionStatus.Disconnected) {
          voiceConnection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
          });
          playSong(voiceConnection, message.channel, songQueue);
        } else {
          message.reply(`${song.title} added to the queue!`);
        }
      } else {
        return message.channel.send('Invalid YouTube URL!');
      }
    } else {
      const searchResults = await ytsr(query, { limit: 5 }).catch(console.error);
      if (!searchResults || !searchResults.items.length) {
        return message.channel.send('No results found!');
      }
      const videoResults = searchResults.items.filter(item => item.type === 'video');
      if (videoResults.length === 0) {
        return message.channel.send('No video results found!');
      }
      const embed = new EmbedBuilder()
        .setColor('#ff74aa')
        .setTitle('Select a Song')
        .setDescription(videoResults.map((video, index) => `${index + 1}. [${video.title}](${video.url})`).join('\n'))
        .setFooter({ text: 'Confused? Try $help\nPowered by 🌟GLOSTARS®' });

      const buttons = new ActionRowBuilder()
        .addComponents(
          videoResults.map((_, index) => 
            new ButtonBuilder()
              .setCustomId(`song_select_${index}`)
              .setLabel(`${index + 1}`)
              .setStyle(ButtonStyle.Primary)
          )
        );

      const selectionMessage = await message.channel.send({ embeds: [embed], components: [buttons] });
      const filter = i => {
        i.deferUpdate();
        return i.customId.startsWith('song_select_') && i.user.id === message.author.id;
      };
      const collector = selectionMessage.createMessageComponentCollector({ filter, time: 15000 });

      collector.on('collect', async i => {
        const choice = parseInt(i.customId.split('_')[2]);
        const selectedSong = videoResults[choice];
        songQueue.push({ title: selectedSong.title, url: selectedSong.url });
        message.channel.send(`${selectedSong.title} added to the queue!`);
        if (!voiceConnection || voiceConnection.state.status === VoiceConnectionStatus.Disconnected) {
          voiceConnection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
          });
          playSong(voiceConnection, message.channel, songQueue);
        }
      });

      collector.on('end', collected => {
        if (collected.size === 0) message.channel.send('You did not select a song in time!');
      });
    }
  }

  // Skip Command
  if (message.content.toLowerCase() === '$skip' || message.content.toLowerCase() === '$s') {
    if (!dispatcher) {
      return message.channel.send('There is no song to skip!');
    }
    dispatcher.stop();
    message.channel.send('Skipped the current song!');
  }


    // Queue Command
    if (message.content.toLowerCase() === '$q') {
      if (songQueue.length === 0) {
        return message.channel.send('The song queue is empty!');
      }
      const queueEmbed = new EmbedBuilder()
        .setColor('#ff74aa')
        .setTitle('Queue')
        .setDescription('Up Next!')
        .addFields(songQueue.map((song, index) => ({ 
          name: `${index + 1}. ${song.title}`, 
          value: song.url
        })))
        .setFooter({ text: 'Use $play to add more songs to the queue\nUse $skip to skip the current song' });
      return message.channel.send({ embeds: [queueEmbed] });
    }

  // Leave Command
  if (message.content.toLowerCase() === '$leave' || message.content.toLowerCase() === '$dc') {
    if (!voiceConnection) {
      return message.channel.send('I am not in a voice channel!');
    }
    cleanUp();
    songQueue.length = 0; // Clear the queue
    message.channel.send('Leaving the voice channel and clearing the queue!');
  }

  // Set Designated Channel Command
  if (message.content.toLowerCase() === '$set' && message.member.permissions.has('ADMINISTRATOR')) {
    designatedChannelId = message.channel.id;
    return message.reply(`Mob Radio will now only respond to messages in ${message.channel}.`);
  }
  });
  const token = process.env.DISCORD_BOT_TOKEN;
  client.login(token);