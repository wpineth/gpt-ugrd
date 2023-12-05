const FS = require('fs');

const Discord = require('discord.js');

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.DirectMessages
    ],
    partials: [
      Discord.Partials.Channel,
      Discord.Partials.Message
    ]
});

function relay(channel, message){
    channel.send(message);
}

const config = JSON.parse(FS.readFileSync('data/config.json'));

client.once(Discord.Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Discord.Events.MessageCreate, (message) => {
    if(message.author.id !== client.user.id){
        if(message.channel.type === Discord.ChannelType.DM){
            client.guilds.fetch(config.guild_id).then((guild) => {
                guild.channels.fetch().then((channels) => {
                    const channel = Array.from(channels.filter((channel) => channel.name === message.author.id).values())[0];

                    if(channel === undefined){
                        guild.channels.create({
                            name: message.author.id,
                            type: Discord.ChannelType.GuildText,
                            parent: config.category_id,
                        }).then((channel) => {
                            relay(channel, message.content);
                        });
                    }else{
                        relay(channel, message.content);
                    }
                });
            });
        }else if(message.guildId === config.guild_id){
            client.users.fetch(message.channel.name).then((user) => {
                user.send(message.content).catch((err) => {
                    console.log(err);
                });
            });
        }
    }
});

client.login(config.token);