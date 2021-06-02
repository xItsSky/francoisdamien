module.exports = function(client) {
    client.on('voiceStateUpdate', async (oldMember, newMember) => {
        let role = newMember.member.roles.cache.find(role => role.name === "bot");

        if(role === undefined && newMember.channel === null && (oldMember.channel !== null) ||
            role === undefined && newMember.channel.id === process.env.AFK_ID && (oldMember.channel !== null)) {
            const connection = await oldMember.channel.join();

            const dispatcher = connection.play('./mp3/sors.mp3');

            dispatcher.setVolume(0.5); // half the volume

            dispatcher.on('finish', () => {
                dispatcher.destroy();
                connection.disconnect();
            });
        }
    });
};
