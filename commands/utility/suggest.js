const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const suggestionSchema = require('../../models/suggestion.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('suggestion')
        .addStringOption(option => option.setName('suggestion').setDescription('The suggestion to send').setRequired(true)),
    // .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true })

        const suggestion = interaction.options.get('suggestion').value;

        const data = await suggestionSchema.findOne({ Guild: interaction.guild.id });

        if(!data) {
            interaction.editReply({ content: `Suggestion is not enabled in this server yet. Ask your Admin to enable suggestions.` });
            return;
        }

        const toChannelId = data.Channel;
        const toChannel = await interaction.client.channels.fetch(toChannelId);

        // const upButton = new ButtonBuilder()
        //     .setLabel('UpVote: [0]')
        //     .setCustomId(`Up Vote`)
        //     .setStyle(ButtonStyle.Primary);
        // const downButton = new ButtonBuilder()
        //     .setLabel('DownVote: [0]')
        //     .setCustomId(`Down Vote`)
        //     .setStyle(ButtonStyle.Danger);
        // const embedButtonRow = new ActionRowBuilder()
        //     .addComponents(upButton, downButton);

        const suggestionEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Suggestion`)
            .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.avatarURL()})
            .setDescription(`> ${suggestion}`)
            .addFields(
                { name: `Suggestor`, value: `${interaction.user}` },
                { name: `Status`, value: `Pending` }
            )
            .setTimestamp()
            .setFooter({ text: `${interaction.guild.name} suggestions` })
            
        // const sentSuggestion = await toChannel.send({ embeds: [suggestionEmbed], components: [embedButtonRow]});
        const sentSuggestion = await toChannel.send({ embeds: [suggestionEmbed] });
        await sentSuggestion.react("⬆️");
        await sentSuggestion.react("⬇️");
        await interaction.editReply({ content: `You suggestion is successfully created`, ephemeral: true })

    },
};