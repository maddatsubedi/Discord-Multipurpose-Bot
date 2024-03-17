const { PermissionsBitField, EmbedBuilder, ChannelType, ActionRowBuilder, SlashCommandBuilder, StringSelectMenuBuilder } = require('discord.js');
const ticketSchema = require('../../models/ticketSchema.js');

// Now you can use the `Ticket` and `UserTicket` models here


module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-set')
        .setDescription('This sets up the ticket message and system')
        .addChannelOption(option => option.setName('channel').setDescription('The channel you want to send the ticket message in').addChannelTypes(ChannelType.GuildText).setRequired(true))
        .addChannelOption(option => option.setName('category').setDescription('The category you want the tickets to be sent in').addChannelTypes(ChannelType.GuildCategory).setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('The moderation role for Tickets').setRequired(true))
        .addChannelOption(option => option.setName('tochannel').setDescription('The channel you want the ticket contents to be sent in').addChannelTypes(ChannelType.GuildText).setRequired(true)),
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: "you must have admin to set up tickets", ephemeral: true });

        const channel = interaction.options.getChannel('channel');
        const category = interaction.options.getChannel('category');
        const tochannel = interaction.options.getChannel('tochannel');
        const moderationRole = interaction.options.get('role');

        const data = await ticketSchema.findOne({ Guild: interaction.guild.id });
        if (!data) {
            ticketSchema.create({
                Guild: interaction.guild.id,
                Channel: category.id,
                Tochannel: tochannel.id,
                Modrole: moderationRole.value,
                Ticket: 'first'
            })
        } else {
            await interaction.reply({ content: "You already have a ticket message set up. You can run /ticket-disable to remove it" });
            return;
        }
        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle(`Ticket System`)
            .setDescription(`If you have any problem, open a ticket to talk to staff members!`)
            .setFooter({ text: `${interaction.guild.name} tickets` })

        const menu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select')
                    .setMaxValues(1)
                    .setPlaceholder(`Select a topic...`)
                    .addOptions(
                        {
                            label: '✅ General Support',
                            value: 'Subject: General Support'
                        },
                        {
                            label: '🛡️ Moderation Support',
                            value: 'Subject: Moderation Support'
                        },
                        {
                            label: '🖥️ Server Support',
                            value: 'Subject: Server Support'
                        },
                        {
                            label: '🔄 Other',
                            value: 'Subject: Other'
                        },
                    )
            )

        await channel.send({ embeds: [embed], components: [menu] });
        await interaction.reply({ content: `Ticket System has been set up in ${channel}` });

    }
}