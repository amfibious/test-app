
const _ = require('lodash');
const Joi = require('joi');
const {auth, roles} = require('../middlewares/auth');
const mongoose = require('mongoose');
const express = require('express');
const Test = require('../models/test')
const router = express.Router();

//GET: /api/tests/getTests
router.get('/getTests', auth, roles(['user']), async (req, res) => {
    await Test.find({ user: mongoose.Types.ObjectId(req.user._id) }, (err, doc) => {
        if (err) return res.status(500).send(err);
        res.send(doc);
    })
    .sort('-date');
});

//GET: /api/tests/getTestsAsync
router.get('/getTestsAsync', auth, roles(['user']), async (req, res) => {
    await Test.find({ user: mongoose.Types.ObjectId(req.user._id) }, (err, doc) => {
        if (err) return res.status(500).send(err);
        res.send(doc);
    })
    .populate('questions')
    .sort('-date');
});

//GET: /api/tests/getTest/:id
router.get('/getTest/:id', auth, roles(['candidate']), async (req, res) => {
    if(req.candidate.test != req.params.id) return res.status(403).send("You are not for this test")
    await Test.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(doc); 
    });
});

//GET: /api/tests/getTestById/:id
router.get('/getTestById/:id', auth, roles(['user']), async (req, res) => {
    await Test.findById(mongoose.Types.ObjectId(req.params.id))
        .exec(function (err, doc) {
            if (err) res.status(500).send(err);
            if(req.user._id != doc.user) return res.status(403).send("Forbidden from viewing record of another user")
            res.send(doc);
        });
});

// //GET: /api/tests/:id/answers
// router.get('/:id/answer', async (req, res) => {
//     await Test.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
//         if (err) res.status(500).send(err);
//         res.send(doc.questions.find(o => o.isAnswer)); 
//     });
// });

//POST: /api/tests/createTest
router.post('/createTest', auth, roles(['user']), async (req, res) => {
    const test = new Test(req.body);
    test.user = req.user._id;

    try {
        await test.save();
        res.status(201).send(test);
    } catch (ex) {
        console.log(ex.errors);
        res.status(500).send(ex);
    }
});

//PUT: /api/tests/updateTest/:id
router.put('/updateTest/:id', auth, roles(['user']), async (req, res) => {
    await Test.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        if(req.user._id != doc.user) return res.status(403).send("Forbidden from updating record of another user")
        doc.set(_.pick(req.body, ['title', 'passMark', 'date', 'duration', 'isNegMark', 'strict']));
        const updateResult = doc.save();
        res.send(updateResult); 
    });
});

//DELETE: /api/tests/deleteTest/:id
router.delete('/deleteTest/:id', auth, roles(['user']), async (req, res) => {
    await Test.findOne(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        if(req.user._id != doc.user) return res.status(403).send("Forbidden from deleting record of another user")
        Test.remove({_id: doc._id}).exec();
        res.send(); 
    });
});

module.exports = router;