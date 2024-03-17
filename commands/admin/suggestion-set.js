const { PermissionsBitField, ChannelType, SlashCommandBuilder } = require('discord.js');
const suggestionSchema = require('../../models/suggestion.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggestion-set')
        .setDescription('This sets up the suggestion system')
        .addChannelOption(option => option.setName('channel').setDescription('The channel to show the suggestion').addChannelTypes(ChannelType.GuildText).setRequired(true)),
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: "you must have admin to set up suggestions", ephemeral: true });

        const channel = interaction.options.getChannel('channel');

        const data = await suggestionSchema.findOne({ Guild: interaction.guild.id });

        if (!data) {
            suggestionSchema.create({
                Guild: interaction.guild.id,
                Channel: channel.id,
            })
        } else {
            await interaction.reply({ content: "You already have a suggestions set up. You can run /suggestion-disable to remove it" });
            return;
        }
        await channel.permissionOverwrites.set([
            {
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.AddReactions],
            }
        ]);
        await interaction.reply({ content: `Suggestion System has been set up in ${channel}` });

    }
}