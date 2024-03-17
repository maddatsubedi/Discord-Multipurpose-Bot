const { Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// console.log(musicCommandFiles);

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			if ('execute' in command) {
				await command.execute(interaction);
			} else if ('run' in command) {
				await command.run(interaction);
			} else {
				console.log("Error running command")
			}
		} catch (error) {
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}
	},
};