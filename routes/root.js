
const express = require('express');
const users = require('./setup/users');
const account = require('./setup/account');
const logins = require('./setup/logins');
const roles = require('./setup/roles');
const tests = require('./tests');
const testEntries = require('./test-entries');
const questions = require('./questions');
const candidates = require('./candidates');
const config = require('config');
const router = express.Router();

// app routes
router.use('/api/account/', account);
router.use('/api/setup/logins', logins);
router.use('/api/users', users);
router.use('/api/roles', roles);
router.use('/api/candidates', candidates);

router.use('/api/tests', tests);
router.use('/api/testEntries', testEntries);
router.use('/api/questions', questions);
//
router.get('/', (req, res) => {
    res.send(`<h1>Hello World!</h1> 
    <h2>This is <strong>${config.get('name')}</strong>- ${config.get('description')}</h2>`);
});

router.get('**', (req, res) => {
    res.send(`<h1>PAGE NOT FOUND</h1>`);
});

module.exports = router;