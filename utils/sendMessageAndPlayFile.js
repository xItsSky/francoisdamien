/**
 * Function that play a sound and send a message
 */

module.exports = function (message,textToSend,sound){
    message.member.voice.channel.join().then(connection =>
        {
            const dispatcher = connection.play(sound);

            dispatcher.setVolume(0.5); // half the volume

            dispatcher.on('finish', () => {
                dispatcher.destroy();
                connection.disconnect();
            });
        }
    )

    message.inlineReply(textToSend);
}