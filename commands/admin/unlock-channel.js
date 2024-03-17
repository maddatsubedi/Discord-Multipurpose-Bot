const { PermissionsBitField, ChannelType, SlashCommandBuilder, EmbedBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock-channel')
        .setDescription('Unlocks a channel')
        .addChannelOption(option => option.setName('channel').setDescription('The channel to unlock').addChannelTypes(ChannelType.GuildText).setRequired(true)),
    async execute(interaction) {

        await interaction.deferReply();

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return await interaction.editReply({ content: "you must have 'Manage Channels' permission to unlock channels", ephemeral: true });

        const channel = interaction.options.getChannel('channel');

        const channelUnlockEmbed = new EmbedBuilder()
            .setTitle("Channel Updates")
            .setColor('Random')
            .setDescription(`🔒 ${channel} has been Unlocked`)

        await channel.permissionOverwrites.set([
            {
                id: interaction.guild.id,
                allow: [PermissionsBitField.Flags.SendMessages],
            }
        ]);
        await channel.send({ embeds: [channelUnlockEmbed] });
        await interaction.editReply({ content: `${channel} has been successfully Unlocked` });

    }
}