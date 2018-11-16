const config = require('config');

cors = function(req, res, next){
    if(config.has("remote-client-base-url"))
        res.header("Access-Control-Allow-Origin", "http://localhost:4200"); //remove this and use the line below
        // res.header("Access-Control-Allow-Origin", config.get("remote-client-base-url"));
    res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,No-Auth,Accept,x-auth-token");
    next();
}

module.exports = cors;