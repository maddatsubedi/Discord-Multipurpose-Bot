const {Schema, model} = require('mongoose');

let ticketSchema = new Schema({
    Guild: String,
    Channel: String,
    Tochannel: String,
    Modrole: String,
    Ticket: String,
});

module.exports = model('ticketSchema', ticketSchema);