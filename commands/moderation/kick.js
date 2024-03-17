const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { appendToSheet } = require('../../utils/sheetsUtils.js');
const { logChannelId } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Select a member and kick them')
		.addUserOption(option => option.setName('target').setDescription('The member to kick').setRequired(true))
		.addStringOption(option => option.setName('reason').setDescription('The reason for kick').setRequired(true))
		.addStringOption(option => option.setName('message').setDescription('The message to send to target (optional)')),
	async execute(interaction) {

		if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return await interaction.reply({ content: "you must have 'Kick Members' permission to kick members", ephemeral: true });

		await interaction.deferReply({ ephemeral: true });

		const member = interaction.options.getMember('target');
		const reason = await interaction.options.get('reason').value;
		const message = await interaction.options.get('message')?.value;
		const interactionUser = await interaction.guild.members.cache.get(interaction.user.id);
		const logChannel = await interaction.guild.channels.fetch(logChannelId);

		const sheetName = 'kicks';
		const range = 'A:H';
		const date = new Date().toUTCString();

		const data = `${member.user.username},.,${member.user.id},.,${interaction.user.username},.,${interaction.user.id},.,${reason},.,Moderation Command,.,${date},.,N/P`;

		if (member.user.bot) {
			const kickEmbed = new EmbedBuilder()
				.setColor('Red')
				.setDescription(`:x: I cannot kick Bot!`)
			await interaction.editReply({ embeds: [kickEmbed] });
			return;
		}

		if (member.user.id == interaction.user.id) {
			const kickEmbed = new EmbedBuilder()
				.setColor('Red')
				.setDescription(`:x: You cannot kick yourself!`)
			await interaction.editReply({ embeds: [kickEmbed] });
			return;
		}

		if (member.roles.highest.position >= interactionUser.roles.highest.position) {
			const kickEmbed = new EmbedBuilder()
				.setColor('Red')
				.setDescription(`:x: I cannot kick this Member, because He/She is higher/Equal to Your Role Position!`)
			await interaction.editReply({ embeds: [kickEmbed] });
			return;
		}

		await appendToSheet(sheetName, range, data)
			.then(() => {
				// console.log('Data appended successfully.');
			})
			.catch((error) => {
				console.error('An error occurred:', error);
			});


		const kickEmbed = new EmbedBuilder()
			.setColor('Red')
			.setTitle(`Server Logging`)
			.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
			.setDescription(`${member} is kicked`)
			.addFields(
				{ name: `Action`, value: `> Moderation Command` },
				{ name: `Reason`, value: `> ${reason}` },
				{ name: `Moderator`, value: `> ${interaction.user}` }
			)
			.setTimestamp()
			.setFooter({ text: `${interaction.guild.name} moderations` })

		const dmKickEmbed = new EmbedBuilder()
			.setColor('Red')
			.setTitle(`Server Moderation`)
			.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
			.setDescription(`You are kicked from the server`)
			.addFields(
				{ name: `Reason`, value: `> ${reason}` },
				{ name: `Message`, value: `> ${message || `Not given`}` },
				{ name: `Moderator`, value: `> ${interaction.user}` }
			)
			.setTimestamp()
			.setFooter({ text: `${interaction.guild.name} moderations` })

		await member.send({ embeds: [dmKickEmbed] }).catch(() => console.log("Cannot send DM"));
		// await member.kick().catch(() => console.log("Cannot kick member"));
		await logChannel.send({ embeds: [kickEmbed] });

		kickEmbed.setTitle(`Server Moderation`);
		await interaction.channel.send({ embeds: [kickEmbed] });

		return interaction.editReply({ content: `Successfully kicked: ${member}` });
	},
};