const { PermissionsBitField, ChannelType, SlashCommandBuilder } = require('discord.js');
const afkSchema = require('../../models/afkSchema.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set an AFK status to display when you are mentioned (or view your currently set status message)')
        .addStringOption(option => option.setName('message').setDescription('The message to set as your AFK status.')),
    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true });

        const message = interaction.options.get('message')?.value;

        if (message) {
            if (message.length > 10) {
                await interaction.editReply(`Set AFK Status no longer than 10 characters.`);
                return;
            }
        }

        const data = await afkSchema.findOne({ Guild: interaction.guild.id, User: interaction.user.id }) || false;

        if (!data && !!message) {
            const newTicket = new afkSchema({
                Guild: interaction.guild.id,
                User: interaction.user.id,
                Message: message,
            });
            await newTicket.save();
            await interaction.editReply(`You have successfully been set to AFK with the message: \`${message}\``);
            return;
        }
        
        if (!!data && !message) {
            await interaction.editReply(`You are currently AFK with the message: \`${data.Message}\``);
            return;
        }
        
        if (!data && !message) {
            await interaction.editReply(`You are not currently AFK.`);
            return;
        }
        
        if (!!data && !!message) {
            data.Message = message;
            await data.save();
            await interaction.editReply(`Successfully updated your AFK message to: \`${message}\``);
            return;
        }


    }
}