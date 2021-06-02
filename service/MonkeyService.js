var gifSearch = require('gif-search');

module.exports = function(client){
    client.on('message', (message) =>
        {
            gifSearch.setAPIKey(process.env.GIFTOKEN);
            if(message.content.toLowerCase().includes("monkey") || message.content.toLowerCase().includes("singe")){
                gifSearch.random('monkey').then(gifUrl =>
                    {
                        message.channel.send(gifUrl);
                    }
                )
            }
        }
    )
}