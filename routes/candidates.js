const _ = require('lodash');
const bcrypt = require('bcrypt');
const { auth, roles } = require('../middlewares/auth');
const { Candidate, validateCandidate } = require('../models/candidate');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();



//POST: /api/candidates/tokenAuth
router.post('/tokenAuth', async (req, res) => {
    const { error } = validateCandidate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    await Candidate.findOne({ username: req.body.username }, (err,candidate) => {
        if(!candidate) return res.status(400).send('Invalid username and password combination.');
        bcrypt.compare(req.body.password, candidate.password, (err, same) => {
            if(!same) {
                return res.status(400).send('Invalid username and password combination.');
            }
            const token = candidate.generateAuthToken();
            
            return res.status(202).send(JSON.stringify(token));
        });
    });
});

//=====================AUTH====================
// router.use(auth);
// router.use(roles(['user']))
//=============================================

/* ADMIN ROUTES */
//GET: /api/candidates/getCandidates
router.get('/getCandidates/:testId', async (req, res) => {
    await Candidate.find({ test: mongoose.Types.ObjectId(req.params.testId) }, (err, doc) => {
        if (err) return res.status(500).send(err);
        res.send(doc.map(candidate => _.pick(candidate,['_id', 'regNumber', 'fullName', 'phoneNumber', 'email', 'createdAt', 'updatedAt'])));
    }).sort('lastName')
});

//GET: /api/candidates/getCandidateById/:id
router.get('/getCandidateById/:id', async (req, res) => {
    await Candidate.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(doc);
    });
});

// POST: /api/candidates/createCandidate
router.post('/createCandidate', async (req, res) => {
    const candidate = new Candidate(req.body);
    salt = await bcrypt.genSalt(10);
    await bcrypt.hash(candidate.password, salt, (err, encrypted) => {
        if(err) return res.status('500').send("An internal error occured.");
        candidate.password = encrypted;
        candidate.setRoles('candidate', roles => {
            if(roles) candidate.roles = roles;
            try {
                token = candidate.generateAuthToken();
                if(!token) res.status(500).send("An internal error occured.")
                candidate.save();
                res.header('x-auth-token', token).status(201).send(_.pick(candidate,['name', 'email', 'roles']));
            } catch (ex) {
                console.log(ex.errors);
                res.status(500).send(ex);
            }
        });
    });
});

//PUT: /api/candidates/updateCandidate/:id
router.put('/updateCandidate/:id', auth, async (req, res) => {
    await Candidate.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) return res.status(500).send(err);

        doc.set(_.pick(req.body,['name', 'email', 'password']));
        const updateResult = doc.save();
        res.send(updateResult); 
    });
});

//DELETE: /api/candidates/delete-candidate/:id
router.delete('/deleteCandidate/:id', async (req, res) => {
    await Candidate.findByIdAndRemove(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(doc); 
    });
});

module.exports = router;