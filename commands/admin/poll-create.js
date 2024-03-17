const { PermissionsBitField, ChannelType, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const suggestionSchema = require('../../models/suggestion.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll-create')
        .setDescription('Creates a poll')
        .addStringOption(option => option.setName('title').setDescription('The Query or Title for the Poll').setRequired(true))
        .addStringOption(option => option.setName('choices').setDescription('Enter choices ( seperated by , )').setRequired(true))
        .addStringOption(option =>
            option.setName('choices-method')
                .setDescription('Whether poll reactions should be alphabetical or numerical')
                .setRequired(true)
                .addChoices(
                    { name: 'alphabetical', value: 'alphabetical' },
                    { name: 'numerical', value: 'numerical' },
                ))
        .addChannelOption(option => option.setName('channel').setDescription('The channel to send the poll').addChannelTypes(ChannelType.GuildText).setRequired(true)),
    async execute(interaction) {

        await interaction.deferReply();

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.editReply({ content: "you must have admin to set up polls", ephemeral: true });

        const channel = interaction.options.getChannel('channel');
        const title = interaction.options.get('title').value;
        const choices = interaction.options.get('choices').value;
        const choicesMethod = interaction.options.get('choices-method').value;
        const choicesMethodAlph = choicesMethod == 'alphabetical';

        const choicesArray = choices.split(',').map(item => item.trim());

        if (choicesArray.length > 10) {
            await interaction.editReply("Do not enter more than 10 choices");
            return;
        }

        let pollDescription = ``

        // console.log(choicesArray);
        if (choicesMethodAlph) {
            for(let i = 0; i < choicesArray.length; i++) {
                pollDescription += i == 0 ? `:regional_indicator_a: : ${choicesArray[i]}\n\n`
                : i == 1 ? `:regional_indicator_b: : ${choicesArray[i]}\n\n`
                : i == 2 ? `:regional_indicator_c: : ${choicesArray[i]}\n\n`
                : i == 3 ? `:regional_indicator_d: : ${choicesArray[i]}\n\n`
                : i == 4 ? `:regional_indicator_e: : ${choicesArray[i]}\n\n`
                : i == 5 ? `:regional_indicator_f: : ${choicesArray[i]}\n\n`
                : i == 6 ? `:regional_indicator_g: : ${choicesArray[i]}\n\n`
                : i == 7 ? `:regional_indicator_h: : ${choicesArray[i]}\n\n`
                : i == 8 ? `:regional_indicator_i: : ${choicesArray[i]}\n\n`
                : i == 9 ? `:regional_indicator_j: : ${choicesArray[i]}\n\n`
                : '';
            }
        }
        if (!choicesMethodAlph) {
            for(let i = 0; i < choicesArray.length; i++) {
                pollDescription += i == 0 ? `1️⃣  : ${choicesArray[i]}\n\n`
                : i == 1 ? `2️⃣  : ${choicesArray[i]}\n\n`
                : i == 2 ? `3️⃣  : ${choicesArray[i]}\n\n`
                : i == 3 ? `4️⃣  : ${choicesArray[i]}\n\n`
                : i == 4 ? `5️⃣  : ${choicesArray[i]}\n\n`
                : i == 5 ? `6️⃣  : ${choicesArray[i]}\n\n`
                : i == 6 ? `7️⃣  : ${choicesArray[i]}\n\n`
                : i == 7 ? `8️⃣  : ${choicesArray[i]}\n\n`
                : i == 8 ? `9️⃣  : ${choicesArray[i]}\n\n`
                : i == 9 ? `🔟 : ${choicesArray[i]}\n\n`
                : '';
            }
        }
        
        pollDescription = pollDescription.trim();

        const pollEmbed = new EmbedBuilder()
            .setColor('Random')
            .setTitle(`${title}`)
            .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
            .setDescription(pollDescription)
            .setTimestamp()
            .setFooter({ text: `${interaction.guild.name} polls` })

        await channel.permissionOverwrites.set([
            {
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.AddReactions],
            }
        ]);
        const sentPollEmbed = await channel.send({ embeds: [pollEmbed] });
        if (choicesMethodAlph) {
            for(let i = 0; i < choicesArray.length; i++) {
                await sentPollEmbed.react( i == 0 ? `🇦`
                : i == 1 ? `🇧`
                : i == 2 ? `🇨`
                : i == 3 ? `🇩`
                : i == 4 ? `🇪`
                : i == 5 ? `🇫`
                : i == 6 ? `🇬`
                : i == 7 ? `🇭`
                : i == 8 ? `🇮`
                : i == 9 ? `🇯`
                : '');
            }
        }
        if (!choicesMethodAlph) {
            for(let i = 0; i < choicesArray.length; i++) {
                await sentPollEmbed.react( i == 0 ? `1️⃣`
                : i == 1 ? `2️⃣`
                : i == 2 ? `3️⃣`
                : i == 3 ? `4️⃣`
                : i == 4 ? `5️⃣`
                : i == 5 ? `6️⃣`
                : i == 6 ? `7️⃣`
                : i == 7 ? `8️⃣`
                : i == 8 ? `9️⃣`
                : i == 9 ? `🔟`
                : '');
            }
        }
        await interaction.editReply({ content: `A new poll has been set up in ${channel}` });

    }
}