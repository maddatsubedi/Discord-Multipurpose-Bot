const { PermissionsBitField, ChannelType, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ms = require("ms");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock-channel')
        .setDescription('Locks a channel')
        .addChannelOption(option => option.setName('channel').setDescription('The channel to lock').addChannelTypes(ChannelType.GuildText).setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The channel reason to lock channel (optional)')),
    async execute(interaction) {

        await interaction.deferReply();

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return await interaction.editReply({ content: "you must have 'Manage Channels' permission to lock channels", ephemeral: true });

        const channel = interaction.options.getChannel('channel');
        const reason = interaction.options.get('reason')?.value || `No reason given`;

        const channelLockEmbed = new EmbedBuilder()
            .setTitle("Channel Updates")
            .setColor('Random')
            .setDescription(`🔒 ${channel} has been Locked`)
            .addFields(
                { name: `Reason`, value: `> ${reason}` }
            )

        await channel.permissionOverwrites.set([
            {
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.SendMessages],
            }
        ]);
        await channel.send({ embeds: [channelLockEmbed] });
        await interaction.editReply({ content: `${channel} has been successfully Locked` });

    }
}