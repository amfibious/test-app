const jwt = require('jsonwebtoken');
const config = require('config');
const { Role } = require('../models/setup/role');

// Authentication
auth = function(req, res, next) {
    const token = req.header('x-auth-token');
    //  if(req.method == "OPTIONS"){
    //     req.preflight = true;
    //     return next();
    //  } 

    if(!token) return res.status(401).send('Access denied. No token provided.')

    try{
        const decoded = jwt.verify(token, config.secret);
        if(decoded.test){
            req.candidate = decoded;
            console.log(decoded)
        }
        else{
            req.user = decoded;
        }
        next();
    }
    catch(ex){
        res.status(401).send('Invalid token')
    }
}

// Authorization
roles = (roleNames) => function (req, res, next) {
    var isAuthorized = false;
    if (req.user){
        roleNames.forEach(rName => {
            if(req.user.roles.indexOf(rName) > -1) {
                isAuthorized = true;
                next();
            }
        });
    }  
    else if (req.candidate){
        roleNames.forEach(rName => {
            if(req.candidate.roles.indexOf(rName) > -1){
                isAuthorized = true; 
                next();
            }
        });
    }  
    else{
        return res.status(401).send("Unauthorized");
    } 

    if(isAuthorized !== true){
        res.status(403).send("Access Denied");
    }
 }

module.exports = { auth, roles };