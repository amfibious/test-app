
const { User } = require('../../models/setup/user'),
     { Login } = require('../../models/setup/login'),
    Joi = require('joi'),
    mongoose = require('mongoose'),
    express = require('express'),
    passport = require('passport'),
    bcrypt = require('bcrypt'),
    router = express.Router();


//POST: /api/users/register
router.post('/register', async (req, res) => {
    const user = new User(req.body);
    salt = await bcrypt.genSalt(10);
    await bcrypt.hash(user.password, salt, (err, encrypted) => {
        user.password = encrypted;
        user.setRoles('user', result => {
            if(!result.length) return res.status(500).send("Default role not found!");

            user.roles = result;
            try {
                user.save();
                let token = user.generateAuthToken();
                return res.header('x-auth-token', token).status(201).send(_.pick(user,['name', 'email', 'roles']));
            } catch (ex) {
                console.log(ex.errors);
                return res.status(500).send(ex);
            }
        });
    });
});

//POST: /api/tokenAuth
router.post('/tokenAuth', passport.authenticate('local'), async (req, res) => {
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    await User.findOne({ email: req.body.email }, (err,user) => {
        if(!user) return res.status(400).send('Invalid email or password.');
        bcrypt.compare(req.body.password, user.password, (err, same) => {
            if(!same) {
                user.logins.attempts++;
                user.save();
                return res.status(400).send('Invalid email or password.');
            }
            const token = user.generateAuthToken();
            user.logins.lastLoggedIn = new Date();
            user.logins.attempts = 0;
            user.save();
            return res.status(202).send(JSON.stringify(token));
        })
    })
})

//POST: /api/tokenAuth
// router.post('/tokenAuth', async (req, res) => {
//     const { error } = validate(req.body);
//     if(error) return res.status(400).send(error.details[0].message);

//     await User.findOne({ email: req.body.email }, (err,user) => {
//         if(!user) return res.status(400).send('Invalid email or password.');
//         bcrypt.compare(req.body.password, user.password, (err, same) => {
//             if(!same) {
//                 user.logins.attempts++;
//                 user.save();
//                 return res.status(400).send('Invalid email or password.');
//             }
//             const token = user.generateAuthToken();
//             user.logins.lastLoggedIn = new Date();
//             user.logins.attempts = 0;
//             user.save();
//             return res.status(202).send(JSON.stringify(token));
//         })
//     })
// })


//=====================AUTH====================
// router.use(auth);
//=============================================

//GET: /api/account/getCurrentUser
router.get('/getCurrentUser', auth, async (req, res) => {
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
        if(req.user._id !== doc._id) return res.status(403).send('Forbidden!'
        )
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

function validate(req) {
    const schema = {
        email: Joi.string().min(5).max(64).required(),
        password: Joi.string().min(3).max(64).required()
    }
    return Joi.validate(req, schema);
}

module.exports = router;