const jwt = require('jsonwebtoken');
const config = require('config');
const { Role } = require('../models/setup/role');
const mongoose = require('mongoose');

// Authentication
auth = function(req, res, next) {
    const token = req.header('x-auth-token');
     if(req.method == "OPTIONS") return next();

    if(!token) return res.status(401).send('Access denied. No token provided.')

    try{
        const decoded = jwt.verify(token, config.secret);
        req.user = decoded;
        next();
    }
    catch(ex){
        res.status(400).send('Invalid token')
    }
}

// Authorization
roles = (roleNames) => function (req, res, next) {
    let authorizedUserRoles = [];
    roleNames.forEach(rName => {
        (req.user.roles).find(v => {
             Role.findById(v, (err, role) => {
                role && role.name == rName ? next() : res.status(403).send("Access Denied");
            });
        });
    });
    
 }

module.exports = { auth, roles };