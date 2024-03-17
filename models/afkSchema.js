const {Schema, model} = require('mongoose');

let afkSchema = new Schema({
    Guild: String,
    User: String,
    Message: String
});

module.exports = model('afkSchema', afkSchema);