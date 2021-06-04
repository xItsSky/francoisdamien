let words = ["dégage", "degage", "Sors", "sors"]

module.exports = function(client) {
    client.on('message', async (message) => {
        // If message come from bot, exit
        if(message.author.bot)
            return;

        const args = message.content.split(' ');

        const command = args.shift().toLowerCase();
        const name = args.join(' ');
        if (words.some(word => command === word) && args.length === 1) {
            const member = message.guild.members.cache.find(m => m.user.username.toLowerCase() === name.toLowerCase());

            if(member.voice.channel === null) return;

            const connection = await member.voice.channel.join();
            const dispatcher = connection.play('./mp3/sors.mp3');

            dispatcher.setVolume(0.5); // half the volume

            dispatcher.on('finish', () => {
                dispatcher.destroy();
                member.voice.kick("Ou tu sors ou j'te sors mais va falloir prendre une décision !");
                connection.disconnect();
            });
        }
    });
};
