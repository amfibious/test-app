
const Joi = require('joi');
const mongoose = require('mongoose');
const express = require('express');
const Test = require('../models/test')
const router = express.Router();

//GET: /api/tests/
router.get('/', async (req, res) => {
    await Test.find((err, doc) => {
        if (err) return res.status(500).send(err);
        res.send(doc);
    })
});

//GET: /api/tests/get/:id
router.get('/get/:id', async (req, res) => {
    await Test.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(doc); 
    });
});

//GET: /api/tests/:id
router.get('/:id', async (req, res) => {
    await Test.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(doc); 
    }).populate('questions');
});

//GET: /api/tests/:id/answers
router.get('/:id/answer', async (req, res) => {
    await Test.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(doc.questions.find(o => o.isAnswer)); 
    });
});

//POST: /api/tests
router.post('/', async (req, res) => {
    const test = new Test(req.body);

    try {
        await test.save();
        res.status(201).send(test);
    } catch (ex) {
        console.log(ex.errors);
        res.status(500).send(ex);
    }
});

// Using the Fawn package for transactions
// try{
//     new Fawn.Task()
//         .save('tests', test)
//         .update('questions', {_id: question.id}, {
//             $inc: { number: -1 }
//         })
//         .remove('test-entries', { _id: testEntry.id })
// } catch(ex){

// }

//PUT: /api/tests/:id
router.put('/:id', async (req, res) => {
    await Test.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        doc.set(req.body);
        const updateResult = doc.save();
        res.send(updateResult); 
    });
});

//DELETE: /api/tests/:id
router.delete('/:id', async (req, res) => {
    await Test.findByIdAndRemove(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(doc); 
    });
});

module.exports = router;