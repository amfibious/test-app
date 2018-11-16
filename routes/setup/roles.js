
const Joi = require('joi');
const mongoose = require('mongoose');
const express = require('express');
const { auth, roles } = require('../../middlewares/auth');
const { Role } = require('../../models/setup/role')
const router = express.Router();    


//=====================AUTH====================
// router.use(auth);
// router.use(roles(['admin']))
//=============================================

//GET: /api/roles/
router.get('/getRoles', async (req, res) => {
    await Role.find((err, doc) => {
        if (err) return res.status(500).send(err);
        console.log(doc)
        res.send(doc);
    })
});

//GET: /api/roles/:id
router.get('/getRoleById/:id', async (req, res) => {
    await Role.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(doc); 
    });
});

//POST: /api/roles
router.post('/createRole', async (req, res) => {
    const role = new Role(req.body);

    try {
        await role.save();
        res.status(201).send(role);
    } catch (ex) {
        console.log(ex.errors);
        res.status(500).send(ex);
    }
});

//PUT: /api/roles/:id
router.put('updateRole/:id', async (req, res) => {
    await Role.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        doc.set(req.body);
        const updateResult = doc.save();
        res.send(updateResult); 
    });
});

//DELETE: /api/roles/:id
router.delete('deleteRole/:id', async (req, res) => {
    await Role.findByIdAndRemove(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(doc); 
    });
});

module.exports = router;