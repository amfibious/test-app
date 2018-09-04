
const { Question, validateQuestion } = require('../models/question');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

//GET: /api/questions/
router.get('/', async (req, res) => {
    await Question.find((err, doc) => {
        if (err) return res.status(500).send(err);
        res.send(doc);
    })
});

//GET: /api/questions/:id
router.get('/:id', async (req, res) => {
    await Question.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(doc);
    });
});

//GET: /api/questions/:id/answer
router.get('/:id/answer', async (req, res) => {
    await Question.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(doc.options.find(o => o.isAnswer)); 
    });
});

//POST: /api/questions
router.post('/', async (req, res) => {
    const question = new Question(req.body);
    try {
        await question.save();
        res.status(201).send(question);
    } catch (ex) {
        console.log(ex.errors);
        res.status(500).send(ex);
    }
})

//PUT: /api/questions/:id
router.put('/:id', async (req, res) => {
    await Question.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        doc.set(req.body);
        const updateResult = doc.save();
        res.send(updateResult); 
    });
});

//DELETE: /api/questions/:id
router.delete('/:id', async (req, res) => {
    await Question.findByIdAndRemove(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(doc); 
    });
});

module.exports = router;