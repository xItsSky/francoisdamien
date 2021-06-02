module.exports = function(client) {
    /**
     * When see hello
     */
    return client.on('message', message => {
        // If message come from bot, exit
        if(message.author.bot)
            return;

        if (message.content.includes("Bière") ||
            message.content.includes("bière") ||
            message.content.includes("biere") ||
            message.content.includes("beer")) {
            message.reply(`La première bière, c'est celle qui remet les idées en place !`);
        }
    });
};
