module.exports = function(client) {
    /**
     * On Join detection
     */
    return client.on('guildMemberAdd', member => {
        // Send the message to a designated channel on a server:
        const channel = member.guild.channels.cache.find(ch => ch.id === process.env.SYSTEM_CHANEL_ID);

        // Do nothing if the channel wasn't found on this server
        if (!channel) return;

        // Send the message, mentioning the member
        channel.send(`Ces m'sieur dame bonjour`);
    });
};
