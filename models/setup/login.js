
const Joi = require('joi');
const mongoose = require('mongoose');
const loginSchema = new mongoose.Schema({
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User'},
    time: { type: Date, get: function(){ this._id.getTimeStamp() } },
    attempts: { type: Number }
})

const Login = mongoose.model('Login', loginSchema);

module.exports = Login;