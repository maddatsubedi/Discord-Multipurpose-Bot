const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { appendToSheet } = require('../../utils/sheetsUtils.js');
const { logChannelId } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unban')
		.setDescription('Unban a user')
		.addUserOption(option => option.setName('user-id').setDescription('The member to unban').setRequired(true))
		.addStringOption(option => option.setName('reason').setDescription('The reason for unban').setRequired(true))
		.addStringOption(option => option.setName('message').setDescription('The message to send to target')),
	async execute(interaction) {

		if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return await interaction.reply({ content: "you must have 'Ban Members' permission to unban members", ephemeral: true });

		await interaction.deferReply({ ephemeral: true });

		const member = interaction.options.getUser('user-id');
		const reason = await interaction.options.get('reason').value;
		const message = await interaction.options.get('message')?.value;
		const logChannel = await interaction.guild.channels.fetch(logChannelId);

		if (!member) {
			const banEmbed = new EmbedBuilder()
				.setColor('Red')
				.setDescription(`:x: User not found!`)
			await interaction.editReply({ embeds: [banEmbed] });
			return;
		}

		const sheetName = 'unbans';
		const range = 'A:H';
		const date = new Date().toUTCString();

		const data = `${member.username},.,${member.id},.,${interaction.user.username},.,${interaction.user.id},.,${reason},.,Moderation Command,.,${date},.,N/P`;

		if (member.bot) {
			const unbanEmbed = new EmbedBuilder()
				.setColor('Red')
				.setDescription(`:x: I cannot unban Bot!`)
			await interaction.editReply({ embeds: [unbanEmbed] });
			return;
		}

		if (member.id == interaction.user.id) {
			const unbanEmbed = new EmbedBuilder()
				.setColor('Red')
				.setDescription(`:x: You cannot unban yourself!`)
			await interaction.editReply({ embeds: [unbanEmbed] });
			return;
		}

		let notBanned = false;

		await interaction.guild.members.unban(member).catch((error) => {
			console.log(`Cannot unban member: ${error}`);
			const unbanEmbed = new EmbedBuilder()
				.setColor('Red')
				.setDescription(`:x: Maybe the user is not already banned!`)
			interaction.editReply({ embeds: [unbanEmbed] });
			notBanned = true;
		});

		if (notBanned) return;

		await appendToSheet(sheetName, range, data)
			.then(() => {
				// console.log('Data appended successfully.');
			})
			.catch((error) => {
				console.error('An error occurred:', error);
			});


		const unbanEmbed = new EmbedBuilder()
			.setColor('Green')
			.setTitle(`Server Logging`)
			.setThumbnail(member.displayAvatarURL({ dynamic: true }))
			.setDescription(`${member} is unbanned`)
			.addFields(
				{ name: `Action`, value: `> Moderation Command` },
				{ name: `Reason`, value: `> ${reason}` },
				{ name: `Moderator`, value: `> ${interaction.user}` }
			)
			.setTimestamp()
			.setFooter({ text: `${interaction.guild.name} moderations` })

		const dmUnbanEmbed = new EmbedBuilder()
			.setColor('Green')
			.setTitle(`Server Moderation`)
			.setThumbnail(member.displayAvatarURL({ dynamic: true }))
			.setDescription(`You are unbanned from the server`)
			.addFields(
				{ name: `Reason`, value: `> ${reason}` },
				{ name: `Message`, value: `> ${message || `Not given`}` },
				{ name: `Moderator`, value: `> ${interaction.user}` }
			)
			.setTimestamp()
			.setFooter({ text: `${interaction.guild.name} moderations` })

		await member.send({ embeds: [dmUnbanEmbed] }).catch((error) => console.log(`Cannot send DM: ${error}`));
		await logChannel.send({ embeds: [unbanEmbed] });

		unbanEmbed.setTitle(`Server Moderation`);
		await interaction.channel.send({ embeds: [unbanEmbed] });

		return interaction.editReply({ content: `Successfully unbaned: ${member}` });
	},
};