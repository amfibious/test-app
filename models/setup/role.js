const Joi = require('Joi');
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    // permissions: { type: [ String ] }
});

const Role = mongoose.model('Role', roleSchema);


function validateRole(role){

}

module.exports = { Role };