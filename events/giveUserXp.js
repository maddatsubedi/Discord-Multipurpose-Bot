// const { Events } = require('discord.js');
// const Level = require('../models/level.js');
// const calculateLevelXp = require('../utils/calculateLevelXp.js');
// const { levelChannelId } = require('../config.json');
// const cooldowns = new Set();

// function getRandomXp(min, max) {
//     min = Math.ceil(min);
//     max = Math.floor(max);
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// module.exports = {
//     name: Events.MessageCreate,
//     async execute(message) {
//         const toChannel = await message.client.channels.fetch(levelChannelId);
//         if (!message.inGuild() || message.author.bot || cooldowns.has(message.author.id)) return;

//         const xptoGive = getRandomXp(5, 15);

//         const query = {
//             userId: message.author.id,
//             guildId: message.guild.id,
//         };

//         try {
//             const level = await Level.findOne(query);

//             if (level) {
//                 level.xp += xptoGive;

//                 if (level.xp > calculateLevelXp(level.level)) {
//                     level.xp = 0;
//                     level.level += 1;

//                     toChannel.send(`${message.member} you have leveled up to **level ${level.level}**.`);
//                 }

//                 await level.save().catch((e) => {
//                     console.log(`Error saving updated level: ${e}`);
//                     return;
//                 });

//                 cooldowns.add(message.author.id);
//                 setTimeout(() => {
//                     cooldowns.delete(message.author.id);
//                 }, 60000);

//             }

//             else {
//                 const newLevel = new Level({
//                     userId: message.author.id,
//                     guildId: message.guild.id,
//                     xp: xptoGive,
//                 });

//                 await newLevel.save();
                
//                 cooldowns.add(message.author.id);
//                 setTimeout(() => {
//                     cooldowns.delete(message.author.id);
//                 }, 60000);
//             }

//         } catch (error) {
//             console.log(`Error giving xp: ${error}`);
//         }

//     }
// };
