const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const suggestionSchema = require('../../models/suggestion.js');
// const userSuggestion = require('../../models/userSuggestion.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggestion-disable')
        .setDescription('This disables up the suggestion system'),
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: "you must have admin to set up suggestions", ephemeral: true });

        await suggestionSchema.deleteMany({ Guild: interaction.guild.id });
        // await userSuggestion.deleteMany({ Guild: interaction.guild.id });
        await interaction.reply({ content: "Your suggestion system has been removed" });

    }
}