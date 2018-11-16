
const { Login, validateLogin } = require('../../models/setup/login');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

//GET: /api/logins/
router.get('/', async (req, res) => {
    await Login.find((err, doc) => {
        if (err) return res.status(500).send(err);
        res.send(doc);
    })
});

//POST: /api/logins
router.post('/', async (req, res) => {
    const login = new Login(req.body);
    try {
        await login.save();
        res.status(201).send(login);
    } catch (ex) {
        console.log(ex.errors);
        res.status(500).send(ex);
    }
})

// //GET: /api/logins/:id
// router.get('/:id', async (req, res) => {
//     await Login.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
//         if (err) res.status(500).send(err);
//         res.send(doc);
//     });
// });

// //PUT: /api/logins/:id
// router.put('/:id', async (req, res) => {
//     await Login.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
//         if (err) res.status(500).send(err);
//         doc.set(req.body);
//         const updateResult = doc.save();
//         res.send(updateResult); 
//     });
// });

module.exports = router;