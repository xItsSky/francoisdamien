var insults = require('french-badwords-list');

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

            const connection = await message.member.voice.channel.join();
            const dispatcher = connection.play('./mp3/Respect.mp3');

            dispatcher.setVolume(0.5); // half the volume

            dispatcher.on('finish', () => {
                dispatcher.destroy();
                connection.disconnect();
            });

            message.inlineReply("Un peu de respect !");
        }
    });

}