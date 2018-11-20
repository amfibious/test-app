const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const mongoose = require('mongoose'),
    express = require('express'),
    config = require('config')

const app = express();
const isProduction = app.get('env') === 'production';
//------------------------------------------------------------

if(!config.secret){
  console.log('Fatal Error!');
  process.exit(1);
}

if(isProduction){
  mongoose.connect(config.get('mongoDbConnectionString'), { useNewUrlParser: true })
      .then(() => console.log('Connected to MongoDB.'))
      .catch(err => new Error('A connection error has occured'));    
}
else {
    mongoose.connect('mongodb://localhost/test-app', { useNewUrlParser: true })
        .then(() => {
            console.log('Connected to MongoDB.');
            mongoose.set('debug', true);
        })
        .catch(err => console.log('An error occured. Could not connect to MongoDB.', `[${err.name}]`));
}

require('./middlewares/handlers')(app);
//----------------------------------------------------------------------------------------
//SERVER
const port = process.env.PORT || 3000;
var server = app.listen(port, () => console.log(`Application Started! Listening on port ${server.address().port}`));