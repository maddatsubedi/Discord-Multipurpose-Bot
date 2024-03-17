// const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
// const userSuggestion = require('../models/userSuggestion.js');


// module.exports = {
//     name: Events.InteractionCreate,
//     async execute(interaction) {

//         if (interaction.isChatInputCommand()) return;
//         if (interaction.isButton()) {
//             if (interaction.customId == 'Up Vote' || interaction.customId == 'Down Vote') {
//                 // console.log(interaction.message.components);


//                 // console.log(interaction.message.id);
//                 await interaction.deferReply({ ephemeral: true });

//                 const data = await userSuggestion.findOne(
//                     {
//                         Guild: interaction.guild.id,
//                         User: interaction.user.id,
//                         Suggestion: interaction.message.id
//                     }
//                 );

//                 if (data) {
//                     interaction.editReply({ content: `You have already voted for this suggestion.` });
//                     return;
//                 }

//                 const newUserSuggestion = new userSuggestion({
//                     Guild: interaction.guild.id,
//                     User: interaction.user.id,
//                     Suggestion: interaction.message.id
//                 });

//                 await newUserSuggestion.save();

//                 const upButton = new ButtonBuilder()
//                     .setCustomId(`Up Vote`)
//                     .setStyle(ButtonStyle.Primary);
//                 const downButton = new ButtonBuilder()
//                     .setCustomId(`Down Vote`)
//                     .setStyle(ButtonStyle.Danger);

//                 const upVoteButton = await interaction.message.components[0].components.find(button => button.data.custom_id === 'Up Vote');
//                 const upVoteLabel = upVoteButton.data.label;

//                 const downVoteButton = await interaction.message.components[0].components.find(button => button.data.custom_id === 'Down Vote');
//                 const downVoteLabel = downVoteButton.data.label;

//                 upButton.setLabel(upVoteLabel);
//                 downButton.setLabel(downVoteLabel);


//                 if (interaction.customId == 'Up Vote') {

//                     const upVoteCount = parseInt(upVoteLabel.match(/\[(\d+)\]/)[1], 10);
//                     upButton.setLabel(`UpVote: [${upVoteCount + 1}]`)

//                     const embedbuttonRow = new ActionRowBuilder()
//                         .addComponents(upButton, downButton);
//                     await interaction.message.edit({ components: [embedbuttonRow] });
//                     await interaction.editReply({ content: `Successfully UpVoted the suggestion.` });
//                     return;

//                 }

//                 if (interaction.customId == 'Down Vote') {

//                     const downVoteCount = parseInt(downVoteLabel.match(/\[(\d+)\]/)[1], 10);

//                     downButton.setLabel(`DownVote: [${downVoteCount + 1}]`)

//                     const embedbuttonRow = new ActionRowBuilder()
//                         .addComponents(upButton, downButton);

//                     await interaction.message.edit({ components: [embedbuttonRow] });
//                     await interaction.editReply({ content: `Successfully DownVoted the suggestion.` });
//                     return;

//                 }
//             }
//         }


//     },
// };