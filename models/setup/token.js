
const Joi = require('joi');
const mongoose = require('mongoose');


const verificationTokenSchema = new mongoose.Schema({
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User'},
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }
})

const VerificationToken = mongoose.model('Token', verificationTokenSchema);

module.exports = { VerificationToken };