const _ = require('lodash');
const bcrypt = require('bcrypt');
const { auth, roles } = require('../../middlewares/auth');
const { User, validate } = require('../../models/setup/user');
const { VerificationToken } = require('../../models/setup/token');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();


//GET: /api/users/getUsers
router.get('/getUsers', auth, roles(['admin']), async (req, res) => {
    await User.find((err, doc) => {
        if (err) return res.status(500).send(err);
        res.send(doc.map(user => _.pick(user,['_id', 'name', 'email', 'createdAt', 'roles', 'isActive'])));
    }).populate('roles').sort('name')
});

//GET: /api/users/getUserById/:id
router.get('/getUserById/:id', auth, roles(['admin']), async (req, res) => {
    await User.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(_.pick(doc,['_id','name', 'email', 'phoneNumber', 'createdAt', 'updatedAt', 'roles', 'isActive']));
    });
});

// POST: /api/users/createUser
router.post('/createUser', auth, roles(['admin']), async (req, res) => {
    let { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const user = new User(req.body);
    salt = await bcrypt.genSalt(10);
    await bcrypt.hash(user.password, salt, (err, encrypted) => {
        if(err) return res.status('500').send("An unexpected error occured. Please try again");
        user.password = encrypted;
        user.setRoles('user', roles => {
            if(roles && !user.roles.length) user.roles = roles;
            try {
                user.save();
                res.status(201).send();
            } catch (ex) {
                console.log(ex.errors);
                res.status(500).send(ex);
            }
        });
    });
});

//PUT: /api/users/updateUser/:id
router.put('/updateUser/:id', auth, roles(['admin']), async (req, res) => {
    await User.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) return res.status(500).send(err);

        doc.set(_.pick(req.body,['name', 'email', 'password', 'isActive']));
        try{
            const updateResult = doc.save();
            res.send(updateResult); 
        }
        catch (ex){
            throw(err);
        }
    });
});

//DELETE: /api/users/delete-user/:id
router.delete('/deleteUser/:id', auth, roles(['admin']), async (req, res) => {
    await User.findByIdAndRemove(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(); 
    });
});

module.exports = router;