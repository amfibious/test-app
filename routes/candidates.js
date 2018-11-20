const _ = require('lodash');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { Candidate, validate } = require('../models/candidate');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();


//GET: /api/candidates/getCandidates
router.get('/getCandidates/:testId', auth, roles(['user']), async (req, res) => {
    await Candidate.find({ test: mongoose.Types.ObjectId(req.params.testId) }, (err, doc) => {
        if (err) return res.status(500).send(err);
        res.send(doc.map(candidate => _.pick(candidate,['_id', 'regNumber', 'fullName', 'phoneNumber', 'email', 'createdAt', 'updatedAt'])));
    }).sort('lastName')
});

//GET: /api/candidates/getCandidateById/:id
router.get('/getCandidateById/:id', auth, roles(['user']), async (req, res) => {
    await Candidate.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(doc);
    });
});

// POST: /api/candidates/createCandidate
router.post('/createCandidate', auth, roles(['user']), async (req, res) => {
    let { error } = validate(req.body);
    if (err) return res.status(400).send(error.details[0].message);
    const candidate = new Candidate(req.body);
    salt = await bcrypt.genSalt(10);
    await bcrypt.hash(candidate.password, salt, (err, encrypted) => {
        if(err) return res.status('500').send("An internal error occured.");
        candidate.password = encrypted;
        candidate.setRoles('candidate', roles => {
            if(roles) candidate.roles = roles;
            try {
                candidate.save();
            } catch (ex) {
                console.log(ex.errors);
                res.status(500).send(ex);
            }
        });
    });
});

//PUT: /api/candidates/updateCandidate/:id
router.put('/updateCandidate/:id', auth, roles(['user']), async (req, res) => {
    let { error } = validate(req.body);
    if (err) return res.status(400).send(error.details[0].message);
    await Candidate.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) return res.status(500).send(err);

        doc.set(_.pick(req.body,['name', 'email', 'password']));
        const updateResult = doc.save();
        res.send(updateResult); 
    });
});

//DELETE: /api/candidates/delete-candidate/:id
router.delete('/deleteCandidate/:id', auth, roles(['user']), async (req, res) => {
    await Candidate.findByIdAndRemove(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(doc); 
    });
});

module.exports = router;