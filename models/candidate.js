
const mongoose = require('mongoose');

const Candidate = mongoose.model('Candidate', new mongoose.Schema({
    refNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true }
}));


module.exports = Candidate;