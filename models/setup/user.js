
const Joi = require('Joi');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('config');
const { Role } = require('./role');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, minlength: 3, maxlength: 64, required: true },
        email: { type: String, required: true, minlength: 5, maxlength: 64, unique: true },
        phoneNumber: { type: String, minlength: 5, maxlength: 15, unique: true },
        password: { type: String, required: true },
        active: { type: Boolean, default: false },
        logins: {
            lastLoggedIn: { type: Date },
            attempts: { type: Number, default: 0 }
        },
        roles: [{ 
            type: mongoose.Schema.Types.ObjectId, ref: 'Role'
        }]
    },
    {
        timestamps: true
    });


userSchema.methods.setRoles = async function(roleName, callback){
    await Role.findOne({ name: roleName }, (err, role) => {
        if(role) callback([role._id]);
    })
}

userSchema.methods.generateAuthToken = function(){           
    const token = jwt.sign({ _id: this._id, email: this.email, roles: this.roles, isActive: this.isActive }, config.secret);
    return token;
}

userSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
  };
  
  userSchema.methods.isValidPassword = function(password) {
    bcrypt.compare(password, this.password, (err, same) => {
        return same;
    })
  }

  userSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  };
  
  userSchema.methods.generateJWT = function() {
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);
  
    return jwt.sign({
      id: this._id,
      username: this.username,
      exp: parseInt(exp.getTime() / 1000),
    }, secret);
  };
  
const User = mongoose.model('User', userSchema);

function validateUser(user){
    const schema = {
        email: Joi.string().min(5).max(64).required(),
        password: Joi.string().min(3).max(64).required()
    }
    return Joi.validate(user, schema);
}

module.exports = { User, validateUser };