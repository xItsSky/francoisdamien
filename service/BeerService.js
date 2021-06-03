let IncludesList = require('../utils/IncludesList');
let words = ["Bière", "Biere", "bière", "biere", "Binouze", "binouze"]
var soundPlayerAndMessagesender= require('../utils/sendMessageAndPlayFile');

module.exports = function(client) {
    /**
     * When see hello
     */
    return client.on('message', message => {
        // If message come from bot, exit
        if(message.author.bot)
            return;

        if (IncludesList(message.content, words)) {
            soundPlayerAndMessagesender(message,"La première bière, c'est celle qui remet les idées en place !",'./mp3/beer.mp3');
        }
    });
};
