const { Events, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const afkSchema = require('../models/afkSchema.js');
const afk = require('../commands/utility/afk.js');

const afkPingEmbed = new EmbedBuilder()

const deleteButton = new ButtonBuilder()
    .setCustomId(`afkPingDelete`)
    .setStyle(ButtonStyle.Danger)
    .setEmoji('🗑️');

const embedButtonRow = new ActionRowBuilder()
    .addComponents(deleteButton);

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {

        if (message.author.bot) return;

        if (await message.mentions.users.size < 1) return;

        const mentionedUsers = await message.mentions.users;

        await mentionedUsers.forEach(async (user) => {

            const data = await afkSchema.findOne({ Guild: message.guild.id, User: user.id }) || false;

            if (data) {

                const user = await message.guild.members.fetch(data.User);

                afkPingEmbed.setDescription(`**${user} is currently AFK.**\n\n> ${data.Message}`);
                afkPingEmbed.setColor('Red');
                await message.reply({ embeds: [afkPingEmbed], components: [embedButtonRow] });

            }

        });

    },
};