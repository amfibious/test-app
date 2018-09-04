
const express = require('express');
const tests = require('./tests');
const testEntries = require('./test-entries');
const questions = require('./questions');
// const candidates = require('./candidates');
// const account = require('./account');
// const roles = require('./roles');
// const users = require('./users');
const config = require('config');
const router = express.Router();

router.use('/api/tests/', tests);
router.use('/api/test-entries/', testEntries);
router.use('/api/questions', questions);

router.get('/', (req, res) => {
    res.send(`<h1>Hello World!</h1> 
    <h2>This is <strong>${config.get('name')}</strong>- ${config.get('description')}</h2>`);
});

router.get('**', (req, res) => {
    res.send(`<h1>NOT FOUND</h1>`);
});

module.exports = router;