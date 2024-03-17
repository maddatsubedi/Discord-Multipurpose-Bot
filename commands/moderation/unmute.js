const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { appendToSheet } = require('../../utils/sheetsUtils.js');
const { logChannelId } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('unmutes a user')
        .addUserOption(option => option.setName('member').setDescription('The member to mute').setRequired(true))
        .addStringOption(option => option.setName('message').setDescription('The message to send to member (optional)')),
    // .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) return await interaction.reply({ content: "you must have 'Mute Members' permission to unmute members", ephemeral: true });

        await interaction.deferReply({ ephemeral: true });

        const member = await interaction.options.getMember('member');
        const message = await interaction.options.get('message')?.value;
        const interactionUser = await interaction.guild.members.cache.get(interaction.user.id);
        const clientUser = await interaction.guild.members.cache.get(interaction.client.user.id);
		const logChannel = await interaction.guild.channels.fetch(logChannelId);

        if (member.user.bot) {
            const muteEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`:x: Bot cannot be muted/unmuted!`)
            await interaction.editReply({ embeds: [muteEmbed] });
            return;
        }

        if (member.user.id == interactionUser.id) {
            const muteEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`:x: You cannot unmute yourself!`)
            await interaction.editReply({ embeds: [muteEmbed] });
            return;
        }

        if (member.roles.highest.position >= interactionUser.roles.highest.position) {
            const muteEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`:x: I cannot unmute this Member, because He/She is higher/Equal to Your Role Position!`)
            await interaction.editReply({ embeds: [muteEmbed] });
            return;
        }

        let mutedRole = await member.roles.cache.find((role) => role.name.toLowerCase() === 'muted');
        let highestrolepos = await clientUser.roles.highest.position;

        if (!mutedRole) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`The Member is not muted`)

            interaction.editReply({ embeds: [embed] });
            return;
        }

        if (mutedRole.position > Number(highestrolepos)) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`:x: I cannot access the 'muted' Role, because it's above me!`)
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        try {
            await member.roles.remove(mutedRole);

            const date = new Date().toUTCString();
            const data = `${member.user.username},.,${member.user.id},.,${interaction.user.username},.,${interaction.user.id},.,${message || 'Not given'},.,Moderation Command,.,${date},.,N/P`;
            const sheetName = 'unmutes';
            const range = 'A:H';

            await appendToSheet(sheetName, range, data)
                .then(() => {
                    // console.log('Data appended successfully.');
                })
                .catch((error) => {
                    console.error('An error occurred:', error);
                });

        } catch {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`Something went wrong!`)
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        const unmuteEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle(`Server Moderation`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`${member} is unmuted`)
            .addFields(
                { name: `Moderator`, value: `> ${interaction.user}` }
            )
            .setTimestamp()
            .setFooter({ text: `${interaction.guild.name} moderations` })

        const dmUnmuteEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle(`Server Moderation`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`You are now unmuted in the server`)
            .addFields(
                { name: `Message`, value: `> ${message || `Not given`}` },
                { name: `Moderator`, value: `> ${interaction.user}` }
            )
            .setTimestamp()
            .setFooter({ text: `${interaction.guild.name} moderations` })

        await interaction.channel.send({ embeds: [unmuteEmbed] });
        await logChannel.send({ embeds: [unmuteEmbed] });
        await member.send({ embeds: [dmUnmuteEmbed] }).catch(() => console.log("Cannot send DM"));
        await interaction.editReply(`Successfully unmuted <@${member.user.id}>`);

    },
};