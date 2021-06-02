let words = ["dégage", "degage", "Sors", "Sors"]

module.exports = function(client) {
    client.on('message', async (message) => {
        // If message come from bot, exit
        if(message.author.bot)
            return;

        if (words.some(substring => message.content.includes(substring))) {
            const connection = await message.member.voice.channel.join();
            const dispatcher = connection.play('./mp3/sors.mp3');

            dispatcher.setVolume(0.5); // half the volume

            dispatcher.on('finish', () => {
                dispatcher.destroy();
                connection.disconnect();
            });
        }
    });
};
