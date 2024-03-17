const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getSheetData } = require('../../utils/sheetsUtils.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('Get warnings for a user')
        .addUserOption(option => option.setName('user').setDescription('User to get warnings for').setRequired(true)),
    // .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) return await interaction.reply({ content: "you must have 'Moderation' permission to get warnings", ephemeral: true });

        await interaction.deferReply({ ephemeral: true });

        const member = await interaction.options.getMember('user');

        const sheetName = 'warnings';
        const range = 'A:H';

        if (member.user.bot) {
            const warnEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`:x: I cannot get warnings of a Bot!`)
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


        const warningsEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle(`Server Moderation`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `${interaction.guild.name} warnings` })

        if (!user) {
            warningsEmbed.setColor('Green')
            warningsEmbed.setDescription(`> ${member} has no warnings yet`)

            await interaction.channel.send({ embeds: [warningsEmbed] });
            await interaction.editReply({ embeds: [warningsEmbed] });
            return;

        }

        const count = Number(user[5]);
        const reason = user[4];


        warningsEmbed
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`**${member}'s warnings**`)
            .addFields(
                { name: `Warn Count`, value: `> ${count}` },
                { name: `Last Reason`, value: `> ${reason}` },
            )


        await interaction.channel.send({ embeds: [warningsEmbed] });
        await interaction.editReply(`Successfully fetched warnings of <@${member.user.id}>`);



    },
};