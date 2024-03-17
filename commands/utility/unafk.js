const { PermissionsBitField, ChannelType, SlashCommandBuilder } = require('discord.js');
const afkSchema = require('../../models/afkSchema.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('unafk')
        .setDescription('Removes your AFK message and status.'),
    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true });

        const data = await afkSchema.findOne({ Guild: interaction.guild.id, User: interaction.user.id }) || false;

        if (!data) {
            interaction.editReply(`You are not currently AFK.`);
            return;
        }

        await afkSchema.deleteMany({ Guild: interaction.guild.id, User: interaction.user.id });
        await interaction.editReply(`Successfully removed your AFK status.`);

    }
}