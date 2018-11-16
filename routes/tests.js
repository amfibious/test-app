
const Joi = require('joi');
const mongoose = require('mongoose');
const express = require('express');
const Test = require('../models/test')
const router = express.Router();

//GET: /api/tests/getTests
router.get('/getTests', async (req, res) => {
    await Test.find((err, doc) => {
        if (err) return res.status(500).send(err);
        res.send(doc);
    })
    .sort('-date');
});

//GET: /api/tests/getTestsAsync
router.get('/getTestsAsync', async (req, res) => {
    await Test.find((err, doc) => {
        if (err) return res.status(500).send(err);
        res.send(doc);
    })
    .populate('questions')
    .sort('-date');
});

//GET: /api/tests/getTest/:id
router.get('/getTest/:id', async (req, res) => {
    await Test.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(doc); 
    });
});

//GET: /api/tests/getTestById/:id
router.get('/getTestById/:id', async (req, res) => {
    await Test.findById(mongoose.Types.ObjectId(req.params.id))
        .populate('questions')
        .exec(function (err, doc) {
            if (err) res.status(500).send(err);
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
router.post('/createTest', async (req, res) => {
    const test = new Test(req.body);
    // test.user = req.user._id;

    try {
        await test.save();
        res.status(201).send(test);
    } catch (ex) {
        console.log(ex.errors);
        res.status(500).send(ex);
    }
});

//PUT: /api/tests/updateTest/:id
router.put('/updateTest/:id', async (req, res) => {
    await Test.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        doc.set(req.body);
        const updateResult = doc.save();
        res.send(updateResult); 
    });
});

//DELETE: /api/tests/deleteTest/:id
router.delete('/deleteTest/:id', async (req, res) => {
    await Test.findByIdAndRemove(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(doc); 
    });
});

module.exports = router;