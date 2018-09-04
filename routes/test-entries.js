
const Joi = require('joi');
const events = require('events');
const mongoose = require('mongoose');
const express = require('express');
const TestEntry = require('../models/test-entry')
const router = express.Router();

var timeExpired = false;

//GET: /api/test-entries/get/:id
router.get('/get/:id', async (req, res) => {
    await TestEntry.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(doc); 
    });
});

//POST: /api/test-entries/start
router.post('/start', async (req, res) => {
    const testEntry = new TestEntry(req.body);
    try {
        await testEntry.save();
        res.status(201).send(testEntry);
        setTimeout( () => timeExpired = true, 20000);
    } catch (ex) {
        console.log(ex.errors);
        res.status(500).send(ex);
    }
})

//PUT: /api/test-entries/:id/submit
router.put('/:id/submit', async (req, res) => {
    /* Try to find a way to parse queryparams and get submit=true value */

    if(timeExpired){
        return res.status(400).send('Time expired');
    }
    
    await Test.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        doc.set(req.body);
        const updateResult = doc.save();
        res.send(updateResult); 
    });
});

//DELETE: /api/test-entries/:id
router.delete('/:id', async (req, res) => {
    await Test.findByIdAndRemove(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) res.status(500).send(err);
        res.send(doc); 
    });
});

//START ADMIN ROUTES

    //GET: /api/test-entries/
    router.get('/', async (req, res) => {
        await TestEntry.find((err, doc) => {
            if (err) return res.status(500).send(err);
            res.send(doc);
        })
    });

    //GET: /api/test-entries/:id
    router.get('/:id', async (req, res) => {
        await TestEntry.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
            if (err) res.status(500).send(err);
            res.send(doc); 
        }).populate('test');
    });

// END ADMIN ROUTES

module.exports = router;