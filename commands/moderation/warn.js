const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { appendToSheet, getSheetData, updateUserData } = require('../../utils/sheetsUtils.js');
const { logChannelId } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('warns a user')
        .addUserOption(option => option.setName('member').setDescription('The member to warn').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for warn').setRequired(true)),
    // .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) return await interaction.reply({ content: "you must have 'Mute Members' permission to warn members", ephemeral: true });

        await interaction.deferReply({ ephemeral: true });
        // await interaction.editReply({ content: `<a:Loading:1087045463980658751>` });

        const member = await interaction.options.getMember('member');
        const reason = await interaction.options.get('reason').value;
        const interactionUser = await interaction.guild.members.cache.get(interaction.user.id);
        const clientUser = await interaction.guild.members.cache.get(interaction.client.user.id);
		const logChannel = await interaction.guild.channels.fetch(logChannelId);

        const sheetName = 'warnings';
        const range = 'A:H';
        const date = new Date().toUTCString();

        const data = `${member.user.username},.,${member.user.id},.,${interaction.user.username},.,${interaction.user.id},.,${reason},.,1,.,${date},.,N/P`;

        if (member.user.bot) {
            const warnEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`:x: I cannot warn Bot!`)
            await interaction.editReply({ embeds: [warnEmbed] });
            return;
        }

        if (member.user.id == interaction.user.id) {
            const warnEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`:x: You cannot warn yourself!`)
            await interaction.editReply({ embeds: [warnEmbed] });
            return;
        }

        if (member.roles.highest.position >= interactionUser.roles.highest.position) {
            const warnEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`:x: I cannot warn this Member, because He/She is higher/Equal to Your Role Position!`)
            await interaction.editReply({ embeds: [warnEmbed] });
            return;
        }

        let fetchedData;
        await getSheetData(sheetName, range)
            .then((data) => {
                // console.log('Data fetched successfully.');
                fetchedData = data;
                // You can access and process the fetched data here
            })
            .catch((error) => {
                console.error('An error occurred:', error);
            });

        // console.log(fetchedData);
        const user = await fetchedData.find((row) => row[1] === member.user.id);

        if (!user) {
            await appendToSheet(sheetName, range, data)
                .then(() => {
                    // console.log('Data appended successfully.');
                })
                .catch((error) => {
                    console.error('An error occurred:', error);
                });
        }

        let count;
        if (user) {
            count = Number(user[5]) + 1; // Replace with the new count value

            // Update the user data in the spreadsheet
            await updateUserData(sheetName, member.user.id, reason, count, interaction.user.username, interaction.user.id)
                .then(() => {
                    // console.log('User data updated successfully.');
                })
                .catch((error) => {
                    console.error('An error occurred while updating user data:', error);
                });
        }


        const warnEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(`Server Moderation`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`${member} is warned\n\n\`3 consecutive warnings lead to a mute\``)
            .addFields(
                { name: `Warn Count`, value: `> ${count ? count : '1'}` },
                { name: `Reason`, value: `> ${reason}` },
                { name: `Moderator`, value: `> ${interaction.user}` }
            )
            .setTimestamp()
            .setFooter({ text: `${interaction.guild.name} modetations` })

        const dmWarnEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(`Server Moderation`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`You are warned in the server\n\n\`3 consecutive warnings lead to a mute\``)
            .addFields(
                { name: `Warn Count`, value: `> ${count ? count : '1'}` },
                { name: `Reason`, value: `> ${reason}` },
                { name: `Moderator`, value: `> ${interaction.user}` }
            )
            .setTimestamp()
            .setFooter({ text: `${interaction.guild.name} moderations` })


        await interaction.channel.send({ embeds: [warnEmbed] });

        const logWarnEmbed = warnEmbed.setDescription(`${member} is warned`);

        await logChannel.send({ embeds: [logWarnEmbed] });
        await member.send({ embeds: [dmWarnEmbed] }).catch(() => console.log("Cannot send DM"));
        await interaction.editReply(`Successfully warned <@${member.user.id}>`);


        let mutedRole = await interaction.guild.roles.cache.find((role) => role.name.toLowerCase() === 'muted');
        let highestrolepos = await clientUser.roles.highest.position;

        if (count % 3 == 0) {
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

                const data = `${member.user.username},.,${member.user.id},.,${interaction.user.username},.,${interaction.user.id},.,${reason},.,Auto Moderation (User got 3 warnings),.,${date},.,N/P`;
                const sheetName = 'mutes';
                const range = 'A:H';

                await appendToSheet(sheetName, range, data)
                    .then(() => {
                        // console.log('Data appended successfully.');
                    })
                    .catch((error) => {
                        console.error('An error occurred:', error);
                    });

                const autoMuteEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle(`Server Moderation`)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`${member} is muted`)
                    .addFields(
                        { name: `Action`, value: `> Auto Mod` },
                        { name: `Reason`, value: `> 3 consecutive warnings` }
                    )
                    .setTimestamp()
                    .setFooter({ text: `${interaction.guild.name} moderations` })

                const dmAutoMuteEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle(`Server Moderation`)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`You are muted in the server`)
                    .addFields(
                        { name: `Action`, value: `> Auto Mod` },
                        { name: `Reason`, value: `> 3 consecutive warnings` }
                    )
                    .setTimestamp()
                    .setFooter({ text: `${interaction.guild.name} moderations` })

                await interaction.channel.send({ embeds: [autoMuteEmbed] });
                await logChannel.send({ embeds: [autoMuteEmbed] });
                await member.send({ embeds: [dmAutoMuteEmbed] }).catch(() => console.log("Cannot send DM"));

            } catch {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(`Something went wrong!`)
                await interaction.editReply({ embeds: [embed] })
                return;
            }
        }



    },
};