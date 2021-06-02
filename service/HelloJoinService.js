module.exports = function(client) {
    client.on('voiceStateUpdate', async (oldChan, newChan) => {
        if(newChan.channel !== null) {
            const connection = await newChan.channel.join();

            const dispatcher = connection.play('./mp3/bonjour.mp3');

            dispatcher.setVolume(0.5); // half the volume

            dispatcher.on('finish', () => {
                dispatcher.destroy();
                connection.disconnect();
            });
        }
    });
};
