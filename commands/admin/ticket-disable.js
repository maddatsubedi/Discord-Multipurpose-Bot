const { PermissionsBitField, EmbedBuilder, ChannelType, ActionRowBuilder, SelectMenuBuilder, SlashCommandBuilder } = require('discord.js');
const ticketSchema = require('../../models/ticketSchema.js');
const userTicketSchema = require('../../models/ticketSchema.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-disable')
        .setDescription('This disables up the ticket message and system'),
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: "you must have admin to set up tickets", ephemeral: true });

        await ticketSchema.deleteMany({ Guild: interaction.guild.id });
        await userTicketSchema.deleteMany({ Guild: interaction.guild.id });
        await interaction.reply({ content: "Your ticket system has been removed" });

    }
}