
const Joi = require('joi');
const events = require('events');
const {auth, roles} = require('../middlewares/auth');
const mongoose = require('mongoose');
const express = require('express');
const TestEntry = require('../models/test-entry')
const router = express.Router();

//=====================================
router.use(auth);
//=====================================

//POST: /api/test-entries/start
router.post('/start', async (req, res) => {
    let test = await TestEntry.findById(req.body.test);
    if(test.date > Date.now()){
        return res.status(400).send("Cannot start test before assigned date/time")
    }
    const testEntry = new TestEntry(req.body);
    if(req.candidate._id)
        testEntry.candidate = req.candidate._id;

    try {
        await testEntry.save();
        res.status(201).send(testEntry);
    } catch (ex) {
        console.log(ex.errors);
        res.status(500).send(ex);
    }
})

//PUT: /api/test-entries/submit/id
router.put('/submit/:id', async (req, res) => {
    /* Try to find a way to parse queryparams and get submit=true value */
    if(!req.candidate._id)
        return res.status(401).send("Unknown candidate")

    TestEntry.findOne({ _id: mongoose.SchemaTypes.ObjectId(req.params.id), candidate: req.body.candidate })
    .exec(function (err, doc) {
            if (err) return res.status(500).send(err);
            if (!doc) return res.status(404).send("Invalid candidate or entry not found");
            if(doc.isExpired) return res.status(400).send("Time expired!");
            
            doc.set(req.body);
            const updateResult = doc.save();
            return res.send(updateResult); 
        });
});

//PUT: /api/test-entries/answer/id
router.put('/answer/:id', async (req, res) => {
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

//START ADMIN ROUTES
//===================================
// router.use(roles(['admin']))
//===================================

//GET: /api/test-entries/getAllTestEntries
router.get('/getAllTestEntries', async (req, res) => {
    await TestEntry.find((err, doc) => {
        if (err) return res.status(500).send(err);
        res.send(doc);
    })
});

//GET: /api/test-entries/getTestEntries/testId
router.get('/getTestEntries/:testId', async (req, res) => {
    await TestEntry.find({test: mongoose.Types.ObjectId(req.params.testId)}, (err, doc) => {
        if (err) return res.status(500).send(err);
        res.send(doc);
    })
});

//GET: /api/test-entries/getTestEntry/:id
router.get('/getTestEntry/:candidateId', async (req, res) => {
    await TestEntry.find({candidate: mongoose.Types.ObjectId(req.params.candidateId)}, (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(doc); 
    }).populate('answers');
});

//GET: /api/test-entries/getTestEntryById/:id
router.get('/getTestEntryById/:id', async (req, res) => {
    await TestEntry.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(doc); 
    }).populate('test').populate('answers');
});

// END ADMIN ROUTES

module.exports = router;