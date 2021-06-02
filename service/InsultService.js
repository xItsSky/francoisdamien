var insults = require('french-badwords-list');
var soundPlayerAndMessagesender= require('../utils/sendMessageAndPlayFile');

module.exports = function(client){
    /**
     * When we see an insult
     */
    client.on('message', async(message) => {
        if(message.author.bot){
            return;
        }
        insults.array.push("fdp");
        insults.array.push("pd");
        insults.array.push("mere");
        if(insults.array.some(substring=>message.content.includes(substring))){
            soundPlayerAndMessagesender(message,'Un peu de respect !','./mp3/Respect.mp3');
        }
    });
};