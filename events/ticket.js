const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const ticketSchema = require('../models/ticketSchema.js');
const userTicketSchema = require('../models/userTicketSchema.js');


module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {

        if (interaction.isButton()) return;
        if (interaction.isChatInputCommand()) {
            return;
        }
        if (interaction.isAutocomplete()) return;
        const embedTitle = await interaction.message?.embeds[0]?.data?.title;
        if (embedTitle !== 'Ticket System') return;


        const modal = new ModalBuilder()
            .setTitle(`Provide us these information`)
            .setCustomId('modal')

        const email = new TextInputBuilder()
            .setCustomId('email')
            .setRequired(false)
            .setLabel('Your Email (optional)')
            .setPlaceholder(`Email Address`)
            .setStyle(TextInputStyle.Short)

        const username = new TextInputBuilder()
            .setCustomId('username')
            .setRequired(true)
            .setLabel('Your username')
            .setPlaceholder(`Username`)
            .setStyle(TextInputStyle.Short)

        const reason = new TextInputBuilder()
            .setCustomId('reason')
            .setRequired(true)
            .setLabel('The reason for your ticket')
            .setPlaceholder(`Reason`)
            .setStyle(TextInputStyle.Short)

        const firstActionRow = new ActionRowBuilder().addComponents(email);
        const secondActionRow = new ActionRowBuilder().addComponents(username);
        const thirdActionRow = new ActionRowBuilder().addComponents(reason);

        // const firstActionRow = (new MessageActionRow()).addComponents(email);
        // const secondActionRow = (new MessageActionRow()).addComponents(username);
        // const thirdActionRow = (new MessageActionRow()).addComponents(reason);

        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

        let choices;
        if (interaction.isStringSelectMenu()) {
            choices = interaction.values;

            const result = choices.join('');

            const data = ticketSchema.findOne({ Guild: interaction.guild.id });

            if (data) {

                const filter = { Guild: interaction.guild.id };
                const update = { Ticket: result };

                ticketSchema.updateOne(filter, update, {
                    new: true
                }).then(value => {
                    console.log(value);
                })
            }
        }

        // console.log(modal);

        try {
            if (!interaction.isModalSubmit()) {
                interaction.showModal(modal);
            }
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    },
};