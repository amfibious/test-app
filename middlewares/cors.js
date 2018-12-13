const config = require('config');

cors = function(req, res, next){
    if(config.has("clientBaseUrl")){
        res.header("Access-Control-Allow-Origin", config.get("clientBaseUrl"));
    }
    else{
        res.header("Access-Control-Allow-Origin", "http://localhost:4200");
    }
    res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,No-Auth,Accept,x-auth-token");
    res.header("Access-Control-Allow-Methods","POST,DELETE,PUT,OPTIONS");
    next();
}

module.exports = cors;