
const _ = require('lodash');
const Joi = require('joi');
const events = require('events');
const {auth, roles} = require('../middlewares/auth');
const mongoose = require('mongoose');
const express = require('express');
const TestEntry = require('../models/test-entry');
const { Question } = require('../models/question');
const Test = require('../models/test');
const router = express.Router();

//=====================================
// router.use(auth);
//=====================================

//POST: /api/test-entries/start
router.post('/:testId/start', auth, roles(['candidate']), async (req, res) => {
    let candidate = req.candidate;
    if(!candidate._id) {
        return res.status(403).send("Invalid Candidate");
    }
    if(candidate.test !== req.params.testId){
        return res.status(400).send("Not a candidate for this test")
    }

    let test = await Test.findById(req.params.testId);
    if(test.date && test.date > Date.now()){
        return res.status(400).send("Cannot start test before assigned date/time")
    }

    const testEntry = new TestEntry();
        testEntry.candidate = candidate._id;
        testEntry.test = req.params.testId;
        let questions = await Question.find({test: mongoose.Types.ObjectId(req.params.testId)}).exec();
    try {
        await testEntry.save();
        res.status(201).send({entryID: testEntry._id, questions: questions});
    } catch (ex) {
        console.log(ex.errors);
        res.status(500).send(ex);
    }
})

//PUT: /api/test-entries/submit/id
router.put('/:id/submit', auth, roles(['candidate']), async (req, res) => {
    /* Try to find a way to parse queryparams and get submit=true value */
    TestEntry.findOne({ _id: mongoose.Types.ObjectId(req.params.id),
         candidate: mongoose.Types.ObjectId(req.candidate._id) })
    .exec(function (err, doc) {
            if (err) return res.status(500).send(err);
            if (!doc) return res.status(404).send("Invalid candidate or entry not found");
            if(doc.isExpired) return res.status(400).send("Your time has already expired!");
            if(doc.submitted) return res.status(400).send("You have already submitted");
            
            doc.set({ submitted: true });
            const updateResult = doc.save();
            return res.send(updateResult); 
        });
});

//PUT: /api/test-entries/answer/id
router.put('/answer/:id', auth, roles(['candidate']), async (req, res) => {
    /* Try to find a way to parse queryparams and get submit=true value */
    if(!req.candidate._id)
        return res.status(401).send("Unknown candidate.")

    var submitted = req.query['submitted'];
    TestEntry.findOne({ _id: mongoose.SchemaTypes.ObjectId(req.params.id), candidate: req.body.candidate },
         (err, doc) => {
            if (err) return res.status(500).send(err);
            if (!doc) return res.status(404).send("Invalid candidate or entry not found");
            if(doc.isExpired) return res.status(400).send("Time expired!");
            
            let answered = doc.answers.indexOf(a => a.question == req.body.question);
            if(answered !== -1){
                doc.answers[answered] = req.body;
            }
            else{
                doc.answers.push(req.body);
            }
            const updateResult = doc.save();
            return res.send(); 
        })
    
});

//PUT: /api/:id/addOrUpdateAnswer
router.put('/:id/addOrUpdateAnswer', auth, roles(['candidate']), async (req, res) => {
    /* Try to find a way to parse queryparams and get submit=true value */

    TestEntry.findOne({ _id: mongoose.Types.ObjectId(req.params.id), candidate: req.candidate._id },
         (err, doc) => {
            if (err) return res.status(500).send(err);

            if (!doc || doc.candidate != req.candidate._id) return res.status(404).send("Invalid candidate or entry not found");
            if(doc.isExpired) return res.status(400).send("Your time has already expired!");
            if(doc.submitted) return res.status(400).send("You have already submitted");
            
            let answered = doc.answers.filter(a => a.question == req.body.question);
            if(answered){
                answered = req.body;
                // let indexAnswered = doc.answers.indexOf(answered);
                // indexAnswered = req.body;
            }
            else{
                doc.answers.push(req.body);
            }
            const updateResult = doc.save();
            return res.send(); 
        })
    
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

//START USER ROUTES

//GET: /api/test-entries/getTestEntries/testId
router.get('/getTestEntries/:testId', auth, roles(['user']), async (req, res) => {
    await TestEntry.find({ test: mongoose.Types.ObjectId(req.params.testId)}, (err, doc) => {
        if (err) return res.status(500).send(err);
        if(req.user._id != doc[0].test.user) return res.status(403).send("Forbidden from viewing record of another user")
        res.send(doc);
    }).populate('candidate', { fullName: 1, firstName: 1, middleName: 1, lastName: 1 })
      .populate('test', 'user');
});

//GET: /api/test-entries/getTestEntry/:id
router.get('/getTestEntry/:candidateId', auth, roles(['user']), async (req, res) => {
    await TestEntry.find({ candidate: mongoose.Types.ObjectId(req.params.candidateId), 
        user: mongoose.Types.ObjectId(req.user._id) }, (err, doc) => {
        if (err) return res.status(500).send(err);
        if(req.user._id != doc.test.user) return res.status(403).send("Forbidden from viewing record of another user")
        res.send(doc); 
    }).populate('answers')
      .populate('test');
});

//GET: /api/test-entries/getTestEntryById/:id
router.get('/getTestEntryById/:id', auth, roles(['user']), async (req, res) => {
    await TestEntry.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) return res.status(500).send(err);
        if(req.user._id != doc.test.user) return res.status(403).send("Forbidden from viewing record of another user")
        res.send(doc); 
    }).populate('test').populate('answers');
});

// END ADMIN ROUTES

module.exports = router;