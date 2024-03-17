const {Schema, model} = require('mongoose');

let userSuggestion = new Schema({
    Guild: String,
    User: String,
    Suggestion: String
});

module.exports = model('userSuggestion', userSuggestion);