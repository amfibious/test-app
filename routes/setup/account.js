
const { User, validate } = require('../../models/setup/user'),
     { Role } = require('../../models/setup/role'),
     { Candidate } = require('../../models/candidate'),
     { VerificationToken } = require('../../models/setup/token'),
    Joi = require('joi'),
    mongoose = require('mongoose'),
    express = require('express'),
    bcrypt = require('bcrypt'),
    router = express.Router();
    const _ = require('lodash');


//POST: /api/account/register
router.post('/register', async (req, res) => {
    let { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const user = new User(req.body);
    salt = await bcrypt.genSalt(10);
    await bcrypt.hash(user.password, salt, (err, encrypted) => {
        user.password = encrypted;
        user.setRoles('user', result => {
            if(!(result || result.length)) return res.status(500).send("Default role not found!");
            user.roles = result;

            user.save( err => {
                if (err) return res.status(500).send(err);
                // user.sendVerificationToken();
                res.status(201).send(_.pick(user,['name', 'email', 'roles']));
            });
        });
    });
});

//POST: /api/account/tokenAuth
router.post('/tokenAuth', async (req, res) => {
    await User.findOne({ email: req.body.email }, (err,user) => {
        if(!user) return res.status(400).send('Invalid email or password.');
        bcrypt.compare(req.body.password, user.password, (err, same) => {
            if(!same) {
                user.logins.attempts++;
                user.save();
                return res.status(400).send('Invalid email or password.');
            }
            user.generateAuthToken(token => {
                user.logins.lastLoggedIn = new Date();
                user.logins.attempts = 0;
                user.save();
                return res.status(202).send(JSON.stringify(token));
            });
        })
    })
})

//POST: /api/account/testing/tokenAuth
router.post('/testing/tokenAuth', async (req, res) => {
    await Candidate.findOne({ username: req.body.username }, (err,candidate) => {
        if(!candidate) return res.status(400).send('Invalid username and password combination.');
        bcrypt.compare(req.body.password, candidate.password, (err, same) => {
            if(!same) {
                return res.status(400).send('Invalid username and password combination.');
            }
            candidate.generateAuthToken(token => {
                return res.status(202).send(JSON.stringify(token));
            });
        });
    });
});

//POST: /api/account/verify
router.post('/verify', async (req, res) => {
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    await VerificationToken.findOne({ token: req.body.token }, (err,user) => {
        if(!token) return res.status(400).send({type: 'not-verified', message:'Invalid token. Your token may have expired'});

        User.findById(mongoose.Types.ObjectId(req.body.user), (err, user) => {
            if(!user) return res.status(400).send("We are unable to find a user for this token")
            if(user.active) return res.status(400).send({type: 'already-verified', message:'User has already been verified'});
            user.active = true;
            user.save();
            return res.status(200).send();
        })
    })
})


//=====================AUTH====================
// router.use(auth);
//=============================================

//GET: /api/account/getCurrentUser
router.get('/getCurrentUser', auth, async (req, res) => {
    // if(req.preflight) res.end();
    
    await User.findById(mongoose.Types.ObjectId(req.user._id), (err, user) => {
        if (err) res.status(500).send(err);
        if(!user)   res.status(404).send("User not found")
        res.send(user);
    }).populate('roles');
});

//PUT: /api/account/updateUserProfile/:id
router.put('/updateUserProfile/:id', auth, async (req, res) => {
    await User.findById(mongoose.Types.ObjectId(req.params.id), (err, doc) => {
        if (err) return res.status(500).send(err);
        if(req.user._id !== doc._id) return res.status(403).send()
        
        bcrypt.compare(req.body.oldPassword, doc.password, (err, same) => {
            if(same) {
                doc.set(_.pick(req.body,['name', 'email', 'password']));
                const updateResult = doc.save();
                res.send(updateResult); 
            }
            else{
                res.status(400).send('Wrong password')
            }
        })
    });
});

module.exports = router;