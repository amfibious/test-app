const _ = require('lodash');
const bcrypt = require('bcrypt');
const { auth, roles } = require('../../middlewares/auth');
const { User, validateUser } = require('../../models/setup/user');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

//=====================AUTH====================
// router.use(auth);
// router.use(roles(['admin']))
//=============================================

/* ADMIN ROUTES */
//GET: /api/users/getUsers
router.get('/getUsers', async (req, res) => {
    await User.find((err, doc) => {
        if (err) return res.status(500).send(err);
        res.send(doc.map(user => _.pick(user,['_id', 'name', 'email', 'createdAt', 'roles', 'isActive'])));
    }).populate('roles').sort('name')
});

//GET: /api/users/getUserById/:id
router.get('/getUserById/:id', async (req, res) => {
    await User.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(_.pick(doc,['name', 'email', 'phoneNumber', 'createdAt', 'updatedAt', 'roles', 'isActive']));
    });
});

// POST: /api/users/createUser
router.post('/createUser', async (req, res) => {
    const user = new User(req.body);
    salt = await bcrypt.genSalt(10);
    await bcrypt.hash(user.password, salt, (err, encrypted) => {
        if(err) return res.status('500').send("An internal error occured.");
        user.password = encrypted;
        user.setRoles('user', roles => {
            if(roles && !user.roles) user.roles = roles;
            try {
                token = user.generateAuthToken();
                if(!token) res.status(500).send("An internal error occured.")
                user.save();
                res.header('x-auth-token', token).status(201).send(_.pick(user,['name', 'email', 'roles']));
            } catch (ex) {
                console.log(ex.errors);
                res.status(500).send(ex);
            }
        });
    });
});

//PUT: /api/users/updateUser/:id
router.put('/updateUser/:id', auth, async (req, res) => {
    await User.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) return res.status(500).send(err);

        doc.set(_.pick(req.body,['name', 'email', 'password', 'isActive']));
        const updateResult = doc.save();
        res.send(updateResult); 
    });
});

//DELETE: /api/users/delete-user/:id
router.delete('/deleteUser/:id', async (req, res) => {
    await User.findByIdAndRemove(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(doc); 
    });
});

module.exports = router;