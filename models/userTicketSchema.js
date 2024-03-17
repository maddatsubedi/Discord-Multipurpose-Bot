const {Schema, model} = require('mongoose');

let userTicketSchema = new Schema({
    Guild: String,
    User: String,
    Ticket: String
});

module.exports = model('userTicketSchema', userTicketSchema);