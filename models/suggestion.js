const {Schema, model} = require('mongoose');

let suggestionSchema = new Schema({
    Guild: String,
    Channel: String,
});

module.exports = model('suggestion', suggestionSchema);