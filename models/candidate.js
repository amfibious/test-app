
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
    photo: { type: Array, required: true },
    roles: [{ 
        type: mongoose.Schema.Types.ObjectId, ref: 'Role'
    }]
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
});

candidateSchema.virtual('fullName').get(function(){
    return this.lastName + ', ' + this.firstName + ' ' + this.middleName;
})

candidateSchema.methods.generateAuthToken = async function(callback){   
    await Role.findById(mongoose.Types.ObjectId(this.roles[0]), (err, role) => {
        if(err || !role) return callback(null);
        const token = jwt.sign({ _id: this._id, username: this.username, test: this.test,
            name: this.fullName, roles: [role.name], isActive: this.isActive }, config.secret);
        callback(token);
    });
}

candidateSchema.methods.setRoles = async function(roleName, callback){
    await Role.findOne({ name: roleName }, (err, role) => {
        if(role) callback([role._id]);
    });
}
  
const Candidate = mongoose.model('Candidate', candidateSchema);

function validate(candidate){
    const schema = {
        username: Joi.string().min(5).max(64).required(),
        password: Joi.string().min(3).max(32).required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        test: Joi.string().required()
    }
    return Joi.validate(candidate, schema);
}

module.exports = { Candidate, validate };