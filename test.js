const interaction = 'Hello';
const embedTitle = interaction?.message?.embeds[0]?.data?.title;


console.log(embedTitle == 'Hello');