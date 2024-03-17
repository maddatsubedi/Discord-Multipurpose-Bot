// const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField } = require('discord.js');
// const suggestionSchema = require('../../models/suggestion.js');
// const { appendData, fetchData } = require('../../utils/sheetsUtils.js');

// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName('warn')
//         .setDescription('warns a user')
//         .addUserOption(option => option.setName('member').setDescription('The member to warn').setRequired(true))
//         .addStringOption(option => option.setName('reason').setDescription('The reason for warn').setRequired(true)),
//     // .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
//     async execute(interaction) {

//         if (!interaction.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) return await interaction.reply({ content: "you must have 'Mute Members' permission to warn members", ephemeral: true });

//         await interaction.deferReply({ ephemeral: true });

//         const member = await interaction.options.getMember('member');
//         const reason = await interaction.options.get('reason').value;
//         const interactionUser = await interaction.guild.members.cache.get(interaction.user.id);
//         const clientUser = await interaction.guild.members.cache.get(interaction.client.user.id);

//         const warningRange = 'Sheet1!A:A'; // Specify the range for warnings
//         const warningData = [`${member.user.username}, ${member.user.id}`, `${interaction.user.username}, ${interaction.user.id}`, `${reason}`]; // Specify the warning data
//         let fetchedData;


//         await fetchData(warningRange)
//             .then((warningData) => {
//                 fetchedData = warningData;
//                 // console.log('Warning data:', warningData);
//             })
//             .catch((error) => {
//                 console.error('Error fetching warning data:', error);
//             });

//         let userFound = false;
//         await fetchedData.forEach((str) => {
//             const firstCommaIndex = str.indexOf(',');
//             const userID = str.slice(firstCommaIndex + 1).split(',')[0].trim().replace(/'$/, '');

//             if (userID === member.user.id) {
//                 userFound = true;
//             }
//         });

//         if (!userFound) {
//             await appendData(warningRange, warningData)
//             .then(() => {
//                 console.log('Warning data saved successfully.');
//             })
//             .catch((error) => {
//                 console.error('Error saving warning data:', error);
//             });
//         }

//     },
// };