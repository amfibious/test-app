
const { Question, validate } = require('../models/question');
const express = require('express');
const {auth, roles} = require('../middlewares/auth');
const mongoose = require('mongoose');
const router = express.Router();

// router.use([ auth, roles(['admin', 'user']) ]);

//GET: /api/questions/getQuestions
router.get('/getQuestions', auth, roles(['user']), async (req, res) => {
    await Question.find((err, doc) => {
        if (err) return res.status(500).send(err);
        res.send(doc);
    }).select('-options.isAnswer').sort('number')
});

//GET: /api/questions/getQuestions/testId
router.get('/getQuestions/:testId', auth, roles(['user']), async (req, res) => {
    await Question.find({test: mongoose.Types.ObjectId(req.params.testId)}, (err, doc) => {
        if (err) return res.status(500).send(err);
        if(req.user._id != doc[0].test.user) return res.status(403).send("Forbidden from viewing record of another user")
        res.send(doc);
    }).select('-options.isAnswer').sort('number').populate('test', 'user')
});

//GET: /api/questions/getQuestionById/:id
router.get('/getQuestionById/:id', auth, roles(['user']), async (req, res) => {
    await Question.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        if(req.user._id != doc.test.user) return res.status(403).send("Forbidden from viewing record of another user")
        res.send(doc);
    }).select('-options.isAnswer').populate('test', 'user');
});

//GET: /api/questions/getByIdWithAnswer/:id
router.get('/getQuestionByIdWithAnswer/:id', auth, roles(['user']), async (req, res) => {
    await Question.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        if(req.user._id != doc.test.user) return res.status(403).send("Forbidden from viewing record of another user")
        res.send(doc); 
    }).populate('test', 'user');
});

//POST: /api/questions/createQuestion
router.post('/createQuestion', auth, roles(['user']), async (req, res) => {
    const question = new Question(req.body);
    try {
        await question.save();
        res.status(201).send(question);
    } catch (ex) {
        console.log(ex.errors);
        res.status(500).send(ex);
    }
})

//PUT: /api/questions/updateQuestion/:id
router.put('/updateQuestion/:id', auth, roles(['user']), async (req, res) => {
    await Question.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        doc.set(req.body);
        const updateResult = doc.save();
        res.send(updateResult); 
    });
});

//DELETE: /api/questions/deleteQuestion/:id
router.delete('/deleteQuestion/:id', auth, roles(['user']), async (req, res) => {
    await Question.findByIdAndRemove(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(); 
    });
});

module.exports = router;