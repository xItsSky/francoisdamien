let IncludesList = require('../utils/IncludesList');
let words = ["Bière", "Biere", "bière", "biere", "Binouze", "binouze"]

module.exports = function(client) {
    /**
     * When see hello
     */
    return client.on('message', message => {
        // If message come from bot, exit
        if(message.author.bot)
            return;

        if (IncludesList(message.content, words)) {
            message.reply(`La première bière, c'est celle qui remet les idées en place !`);
        }
    });
};
