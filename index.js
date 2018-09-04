
const mongoose = require('mongoose');
const config = require('config');
const express = require('express');
const home = require('./routes/home')
const app = express();

mongoose.connect('mongodb://localhost/test-app', { useNewUrlParser: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('An error occured. Could not connect to MongoDB', err));
mongoose.set('debug', true);

/* Middlewares */
//Parse Request body with json payload
app.use(express.json());
//Parse request body with url-encoded payload
app.use(express.urlencoded({extended: true}));
//Allows serving static files
app.use(express.static('public'));
//Routing
app.use('/', home);

if(process.env.testApp_password){
    console.log(`env: ${process.env.testApp_password}, NODE_ENV: ${config.get('password')}`)
}

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('app:', app.get('env'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Application Started! Listening on port ${port}`));