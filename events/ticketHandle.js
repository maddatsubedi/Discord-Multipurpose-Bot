const { Events, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField, GuildDefaultMessageNotifications } = require('discord.js');
const ticketSchema = require('../models/ticketSchema.js');
const userTicketSchema = require('../models/userTicketSchema.js');


module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {

        if (interaction.isModalSubmit()) {
            if (interaction.customId == 'modal') {

                try {

                    await interaction.deferReply({ ephemeral: true });
                    // await interaction.reply({ content: `Your ticket is being processed, please wait...`, ephemeral: true });

                    const data = await ticketSchema.findOne({ Guild: interaction.guild.id });
                    const emailInput = interaction.fields.getTextInputValue('email') || 'Email not given';
                    const usernameInput = interaction.fields.getTextInputValue('username');
                    const reasonInput = interaction.fields.getTextInputValue('reason');

                    const postChannel = await interaction.guild.channels.cache.find(c => c.name === `ticket-${interaction.user.id}`);
                    if (postChannel) return await interaction.reply({ content: `You already have a ticket open - ${postChannel}`, ephemeral: true });

                    if (data) {
                        const userData = await userTicketSchema.findOne({ Guild: interaction.guild.id, User: interaction.user.id }) || false;
                        if (!userData.User) {
                            const newTicket = new userTicketSchema({
                                Guild: interaction.guild.id,
                                User: interaction.user.id,
                                Ticket: data.Ticket,
                            });
                            await newTicket.save();
                        }
                    }

                    const userData = await userTicketSchema.findOne({ Guild: interaction.guild.id, User: interaction.user.id });
                    const user = await interaction.guild.members.fetch(userData.User);

                    const category = data.Channel;
                    const Tochannel = data.Tochannel;

                    const toChannel = await interaction.client.channels.fetch(Tochannel);

                    const embed = new EmbedBuilder()
                        .setColor("Blue")
                        .setTitle(`${interaction.user.username}'s Ticket`)
                        .setDescription(`Your ticket is opened. Please wait while the staff review your information`)
                        .addFields(
                            { name: `Email`, value: `${emailInput}` },
                            { name: `Username`, value: `${usernameInput}` },
                            { name: `Type`, value: `${data.Ticket}` },
                            { name: `Reason`, value: `> ${reasonInput}` }
                        )
                        .setFooter({ text: `${interaction.guild.name} tickets` })
                        .setTimestamp()

                    const button = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('ticket')
                                .setLabel(`🗑️ Close Ticket`)
                                .setStyle(ButtonStyle.Danger)
                        )

                    let modRoleID = data.Modrole;
                    let everyoneRole = await interaction.guild.roles.cache.find(r => r.name === '@everyone' && r.rawPosition === 0);

                    let channel = await interaction.guild.channels.create({
                        name: `ticket-${interaction.user.id}`,
                        type: ChannelType.GuildText,
                        parent: `${category}`,
                        permissionOverwrites: [
                            {
                                id: everyoneRole.id,
                                deny: [PermissionsBitField.Flags.ViewChannel],
                            },
                            {
                                id: modRoleID,
                                allow: [PermissionsBitField.Flags.ViewChannel],
                            },
                            {
                                id: interaction.user.id,
                                allow: [PermissionsBitField.Flags.ViewChannel],
                            },
                        ],
                    })

                    let msg = await channel.send({ embeds: [embed], components: [button] });

                    await interaction.editReply(`your ticket is now open in ${channel}`);

                    const collector = msg.createMessageComponentCollector();
                    
                    collector.on('collect', async i => {
                        ; (await channel).delete();

                        let description = userData.Ticket.replace(/^Subject: /, "");

                        const ticketSsnEmbed = new EmbedBuilder()
                            .setColor("LuminousVividPink")
                            .setTitle(`Ticket Session Info`)
                            .setDescription(`>>> **Ticket Subject**\n${description}`)
                            .addFields(
                                { name: `Ticket by`, value: `${user}` },
                                { name: `Closed by`, value: `${interaction.user}` },
                            )
                            .setFooter({ text: `${interaction.guild.name} tickets` })
                            .setTimestamp()

                        const dmEmbed = new EmbedBuilder()
                            .setColor("Blue")
                            .setTitle(`Your Ticket has been closed`)
                            .setDescription(`**If you need any help further, kindly create another ticket**`)
                            .addFields(
                                { name: `> Ticket Subject`, value: `${description}` },
                                { name: `Ticket closed by`, value: `${interaction.user}` }
                            )
                            .setFooter({ text: `${interaction.guild.name} tickets` })
                            .setTimestamp()

                        await user.send({ embeds: [dmEmbed] }).catch(err => {
                            console.log(err);
                        });
                        await userTicketSchema.deleteMany({ Guild: interaction.guild.id, User: interaction.user.id });
                        await toChannel.send({ embeds: [ticketSsnEmbed] }).catch(err => {
                            console.log(err);
                            return;
                        });

                    })
                } catch (error) {
                    console.log(`Error: ${error}`);
                }
            }
        }

    },
};