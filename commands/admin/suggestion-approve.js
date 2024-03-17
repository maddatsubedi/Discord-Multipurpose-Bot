const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField } = require('discord.js');
const suggestionSchema = require('../../models/suggestion.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggestion-approve')
        .setDescription('approve a suggestion')
        .addStringOption(option => option.setName('messageid').setDescription('The Message ID of the suggestion').setRequired(true))
        .addStringOption(option =>
            option.setName('update-method')
                .setDescription('Whether or not approve update should be sent on seperate embed')
                .setRequired(true)
                .addChoices(
                    { name: 'Make_Seperate_Embed', value: 'update' },
                    { name: 'Update_On_Original', value: 'no update' },
                ))
        .addStringOption(option => option.setName('reason').setDescription('The reason for approval (optional)')),
    // .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: "you must have admin to approve suggestions", ephemeral: true });

        await interaction.deferReply({ ephemeral: true });

        const suggestionId = interaction.options.get('messageid').value;
        const suggestionMethod = interaction.options.get('update-method').value;
        const reason = interaction.options.get('reason')?.value;

        const data = await suggestionSchema.findOne({ Guild: interaction.guild.id });

        if (!data) {
            interaction.editReply({ content: `Suggestion is not enabled in this server yet. You can run /suggstion-set to enable suggestion system.` });
            return;
        }

        const channelId = data.Channel;
        const channel = await interaction.client.channels.fetch(channelId);

        const suggestionMsg = await channel.messages.fetch(suggestionId).catch(error => console.log(`Error: ${error}`));

        if (!suggestionMsg || interaction.client.user.id !== suggestionMsg.author.id || suggestionMsg.embeds[0]?.data.title !== 'Suggestion') {
            await interaction.editReply({ content: `No suggestions found with the given messageID.` });
            return;
        }

        const suggestorObj = await suggestionMsg.embeds[0].data.fields.find(obj => obj.name === 'Suggestor');

        const suggestionEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle(`Suggestion`)
            .setAuthor({ name: `${suggestionMsg.embeds[0].data.author.name}`, iconURL: suggestionMsg.embeds[0].data.author.icon_url })
            .setDescription(`${suggestionMsg.embeds[0].data.description}`)
            .addFields(
                { name: `Suggestor`, value: `${suggestorObj.value}` },
                { name: `Status`, value: `Approved` }
            )
            .setTimestamp()
            .setFooter({ text: `${interaction.guild.name} suggestions` })

        const suggestionAppEmbed = new EmbedBuilder()
            .setColor('Green')
            .setTitle(`Suggestion Approved`)
            .setAuthor({ name: `${suggestionMsg.embeds[0].data.author.name}`, iconURL: suggestionMsg.embeds[0].data.author.icon_url })
            .setDescription(`${suggestionMsg.embeds[0].data.description}`)
            .addFields(
                { name: `Reason`, value: `${reason || `No resaon given`}` },
                { name: `Suggestor`, value: `${suggestorObj.value}`, inline: true },
                { name: `Approved by`, value: `${interaction.user}`, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: `${interaction.guild.name} suggestions` })


        await suggestionMsg.edit({ embeds: [suggestionEmbed] });

        if (suggestionMethod == 'update') {

            const sentsuggestionAppEmbed = await channel.send({ embeds: [suggestionAppEmbed] });

            await sentsuggestionAppEmbed.react("✅");
            await sentsuggestionAppEmbed.react("❌");
        }

        await interaction.editReply({ content: `Successfully approved the suggestion.` });

    },
};