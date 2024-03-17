const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {

        if (interaction.isChatInputCommand()) return;

        if (interaction.isButton()) {
            if (interaction.customId == 'afkPingDelete') {
                await interaction.message.delete();
            }
        }


    },
};