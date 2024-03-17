const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { appendToSheet } = require('../../utils/sheetsUtils.js');
const { logChannelId } = require('../../config.json');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('mutes a user')
        .addUserOption(option => option.setName('member').setDescription('The member to mute').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for mute').setRequired(true)),
    // .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) return await interaction.reply({ content: "you must have 'Mute Members' permission to mute members", ephemeral: true });

        await interaction.deferReply({ ephemeral: true });

        const member = await interaction.options.getMember('member');
        const reason = await interaction.options.get('reason').value;
        const interactionUser = await interaction.guild.members.cache.get(interaction.user.id);
        const clientUser = await interaction.guild.members.cache.get(interaction.client.user.id);
		const logChannel = await interaction.guild.channels.fetch(logChannelId);


        // console.log(member.roles.highest.position);
        // console.log(interactionUser.roles.highest.position);

        if (member.user.bot) {
            const muteEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`:x: I cannot mute Bot!`)
            await interaction.editReply({ embeds: [muteEmbed] });
            return;
        }

        if (member.user.id == interactionUser.id) {
            const muteEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`:x: You cannot mute yourself!`)
            await interaction.editReply({ embeds: [muteEmbed] });
            return;
        }

        if (member.roles.highest.position >= interactionUser.roles.highest.position) {
            const muteEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`:x: I cannot mute this Member, because He/She is higher/Equal to Your Role Position!`)
            await interaction.editReply({ embeds: [muteEmbed] });
            return;
        }

        let mutedRole = await interaction.guild.roles.cache.find((role) => role.name.toLowerCase() === 'muted');
        let highestrolepos = await clientUser.roles.highest.position;
        // console.log(highestrolepos);

        if (!mutedRole) {
            mutedRole = await interaction.guild.roles.create({
                name: 'muted',
                color: '#808080',
                position: Number(highestrolepos),
            })
                .catch((error) => {
                    console.log(error);

                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`I COULD NOT CREATE A 'muted' ROLE`)

                    interaction.editReply({ embeds: [embed] });
                    return;
                });
        }
        if (mutedRole.position > Number(highestrolepos)) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`:x: I cannot access the 'muted' Role, because it's above me!`)
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        await interaction.guild.channels.cache.forEach((channel) => {
            try {
                channel.permissionOverwrites.set([
                    {
                        id: mutedRole.id,
                        deny: [
                            PermissionsBitField.Flags.AddReactions,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.Connect,
                            PermissionsBitField.Flags.Speak,
                        ],
                    }
                ]);
            } catch (error) {
                console.log(error);
            }
        });

        try {
            await member.roles.add(mutedRole);
            
            const date = new Date().toUTCString();
            const data = `${member.user.username},.,${member.user.id},.,${interaction.user.username},.,${interaction.user.id},.,${reason},.,Moderation Command,.,${date},.,N/P`;
            const sheetName = 'mutes';
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
            await interaction.editReply({ embeds: [embed] })
                .then((msg) => {
                    msg.delete({ timeout: 5000 });
                });
            return;
        }

        const muteEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(`Server Moderation`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`${member} is muted`)
            .addFields(
                { name: `Reason`, value: `> ${reason}` },
                { name: `Moderator`, value: `> ${interaction.user}` }
            )
            .setTimestamp()
            .setFooter({ text: `${interaction.guild.name} moderations` })

        const dmMuteEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(`Server Moderation`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`You are muted in the server`)
            .addFields(
                { name: `Reason`, value: `> ${reason}` },
                { name: `Moderator`, value: `> ${interaction.user}` }
            )
            .setTimestamp()
            .setFooter({ text: `${interaction.guild.name} moderations` })

        await interaction.channel.send({ embeds: [muteEmbed] });
        await logChannel.send({ embeds: [muteEmbed] });
        await member.send({ embeds: [dmMuteEmbed] }).catch(() => console.log("Cannot send DM"));
        await interaction.editReply(`Successfully muted <@${member.user.id}>`);

    },
};