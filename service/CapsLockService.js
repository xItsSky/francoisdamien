var soundPlayerAndMessagesender= require('../utils/sendMessageAndPlayFile');

module.exports = function(client){
    client.on('message', async (message) =>
        {
            if(message.author.bot){
                return;
            }
            if(message.content === message.content.toUpperCase()){
                soundPlayerAndMessagesender(message,"C'EST EXCESSIVEMENT ENERVANT !","./mp3/enervant.mp3");
            }
        }
    )
}