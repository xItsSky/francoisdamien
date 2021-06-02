const fs = require('fs');

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
            console.log("let's go");

            const connection = await message.member.voice.channel.join();
            const dispatcher = connection.play('./mp3/non.mp3');

            dispatcher.setVolume(0.5); // half the volume

            dispatcher.on('finish', () => {
                dispatcher.destroy();
            });

            message.channel.send(`Qu'est ce qu'y non ? Qu'est ce qu'y non ?! \n Mais qu'est ce que tu fou ici ma fille !`);
        }
    });
};
