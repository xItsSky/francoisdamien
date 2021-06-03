var gifSearch = require('gif-search');

module.exports = function(client){
    client.on('message', (message) =>
        {
            if(message.content.toLowerCase().includes("monkey") || message.content.toLowerCase().includes("singe")){
                gifSearch.setAPIKey(process.env.GIFTOKEN);
                gifSearch.random('monkey').then(gifUrl =>
                    {
                        message.channel.send(gifUrl);
                    }
                )
            }
        }
    )
}