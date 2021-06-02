const fs = require('fs');
var soundPlayerAndMessagesender= require('../utils/sendMessageAndPlayFile');

module.exports = function(client) {
    /**
     * When see hello
     */
    return client.on('message', async (message) => {
        // If message come from bot, exit
        if(message.author.bot)
            return;

        if (message.content.includes("Non") ||
            message.content.includes("non")) {
            soundPlayerAndMessagesender(message,`Qu'est ce qu'y non ? Qu'est ce qu'y non ?! \n Mais qu'est ce que tu fou ici ma fille !`,'./mp3/non.mp3')
        }
    });
};
