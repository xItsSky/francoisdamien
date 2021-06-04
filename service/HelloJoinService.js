module.exports = function(client) {
    client.on('voiceStateUpdate', async (oldMember, newMember) => {
        let role = newMember.member.roles.cache.find(role => role.name === "bot");

        if(newMember.channel !== null && newMember.channel.id === process.env.AFK_ID)
            return;

        if(newMember.channel !== null && (oldMember.channel !== newMember.channel) && role === undefined) {
            const connection = await newMember.channel.join();

            const dispatcher = connection.play('./mp3/Bonjour.mp3');

            dispatcher.setVolume(0.5); // half the volume

            dispatcher.on('finish', () => {
                dispatcher.destroy();
                connection.disconnect();
            });
        }
    });
};
