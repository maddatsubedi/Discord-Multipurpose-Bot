const Event = require("./help-event.js");
const { InteractionType } = require('discord.js');

module.exports = new Event("interactionCreate", async (client, interaction) => {
    
    if (interaction.isChatInputCommand()) {
        if (!(interaction.commandName == "help")) {
            return;
        }
    }

    if (!interaction.inGuild()) return;


    // Slash commands
    if (interaction.type === InteractionType.ApplicationCommand && !interaction.user.bot && interaction.guild) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;

        const args = interaction.options._hoistedOptions.map(option => option.value);

        return command.run(interaction, args, client, true);
    }
});
