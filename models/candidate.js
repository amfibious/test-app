
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('Joi');
const { Role } = require('./setup/role');

 const candidateSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    regNumber: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    // user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
    test: { type: mongoose.SchemaTypes.ObjectId, ref: 'Test', required: true },
    roles: [{ 
        type: mongoose.Schema.Types.ObjectId, ref: 'Role'
    }]
}, {
    timestamps: true
});

candidateSchema.virtual('fullName').get(function(){
    return this.firstName + ' ' + this.middleName + ' ' + this.lastName;
})

candidateSchema.methods.generateAuthToken = function(){           
    const token = jwt.sign({ _id: this._id, username: this.username, test: this.test, roles: this.roles }, config.secret);
    return token;
}

candidateSchema.methods.setRoles = async function(roleName, callback){
    await Role.findOne({ name: roleName }, (err, role) => {
        if(role) callback([role._id]);
    })
}
  
const Candidate = mongoose.model('Candidate', candidateSchema);

function validateCandidate(candidate){
    const schema = {
        username: Joi.string().min(5).max(64).required(),
        password: Joi.string().min(5).required()
    }
    return Joi.validate(candidate, schema);
}

module.exports = { Candidate, validateCandidate };