module.exports = function(client) {
    /**
     * When see hello
     */
    return client.on('message', message => {
        // If message come from bot, exit
        if(message.author.bot)
            return;

        //bonjour
        if (message.content.includes("Bonjour") ||
            message.content.includes("bonjour")) {
            // Send "pong" to the same channel
            message.reply(`M'sieur dame, bonjour`);
        }
        //bonsoir
        else if (message.content.includes("Bonsoir") ||
            message.content.includes("bonsoir")) {
            // Send "pong" to the same channel
            message.reply(`M'sieur dame, bonsoir`);
        }
        //hello
        else if (message.content.includes("Hello") ||
            message.content.includes("hello")) {
            // Send "pong" to the same channel
            message.reply(`M'sieur dame, hello`);
        }
    });
};
