const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { appendToSheet } = require('../../utils/sheetsUtils.js');
const { logChannelId } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Ban a user')
		.addUserOption(option => option.setName('target').setDescription('The member to ban').setRequired(true))
		.addStringOption(option => option.setName('reason').setDescription('The reason for ban').setRequired(true))
		.addStringOption(option => option.setName('message').setDescription('The message to send to target')),
	async execute(interaction) {

		if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return await interaction.reply({ content: "you must have 'Ban Members' permission to ban members", ephemeral: true });

		await interaction.deferReply({ ephemeral: true });

		const member = interaction.options.getMember('target');
		const reason = await interaction.options.get('reason').value;
		const message = await interaction.options.get('message')?.value;
		const interactionUser = await interaction.guild.members.cache.get(interaction.user.id);
		const logChannel = await interaction.guild.channels.fetch(logChannelId);

		if (!member) {
			const banEmbed = new EmbedBuilder()
				.setColor('Red')
				.setDescription(`:x: User not found!`)
			await interaction.editReply({ embeds: [banEmbed] });
			return;
		}

		const sheetName = 'bans';
		const range = 'A:H';
		const date = new Date().toUTCString();

		const data = `${member.user.username},.,${member.user.id},.,${interaction.user.username},.,${interaction.user.id},.,${reason},.,Moderation Command,.,${date},.,N/P`;

		if (member.user.bot) {
			const banEmbed = new EmbedBuilder()
				.setColor('Red')
				.setDescription(`:x: I cannot ban Bot!`)
			await interaction.editReply({ embeds: [banEmbed] });
			return;
		}

		if (member.user.id == interaction.user.id) {
			const banEmbed = new EmbedBuilder()
				.setColor('Red')
				.setDescription(`:x: You cannot ban yourself!`)
			await interaction.editReply({ embeds: [banEmbed] });
			return;
		}

		if (member.roles.highest.position >= interactionUser.roles.highest.position) {
			const banEmbed = new EmbedBuilder()
				.setColor('Red')
				.setDescription(`:x: I cannot ban this Member, because He/She is higher/Equal to Your Role Position!`)
			await interaction.editReply({ embeds: [banEmbed] });
			return;
		}

		const dmBanEmbed = new EmbedBuilder()
			.setColor('Red')
			.setTitle(`Server Moderation`)
			.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
			.setDescription(`You are banned from the server`)
			.addFields(
				{ name: `Reason`, value: `> ${reason}` },
				{ name: `Message`, value: `> ${message || `Not given`}` },
				{ name: `Moderator`, value: `> ${interaction.user}` }
			)
			.setTimestamp()
			.setFooter({ text: `${interaction.guild.name} moderations` })

		await member.send({ embeds: [dmBanEmbed] }).catch(() => console.log("Cannot send DM"));
		await interaction.guild.members.ban(member).catch((error) => {
			console.log(`Cannot ban member: ${error}`);
			const banEmbed = new EmbedBuilder()
				.setColor('Red')
				.setDescription(`:x: Error: Maybe the user is already banned!`)
			interaction.editReply({ embeds: [banEmbed] });
			return;
		});

		await appendToSheet(sheetName, range, data)
			.then(() => {
				// console.log('Data appended successfully.');
			})
			.catch((error) => {
				console.error('An error occurred:', error);
			});


		const banEmbed = new EmbedBuilder()
			.setColor('Red')
			.setTitle(`Server Logging`)
			.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
			.setDescription(`${member} is banned`)
			.addFields(
				{ name: `Action`, value: `> Moderation Command` },
				{ name: `Reason`, value: `> ${reason}` },
				{ name: `Moderator`, value: `> ${interaction.user}` }
			)
			.setTimestamp()
			.setFooter({ text: `${interaction.guild.name} moderations` })


		// console.log(member);

		await logChannel.send({ embeds: [banEmbed] });

		banEmbed.setTitle(`Server Moderation`);
		await interaction.channel.send({ embeds: [banEmbed] });

		return interaction.editReply({ content: `Successfully banned: ${member}` });
	},
};