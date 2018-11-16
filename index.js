const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const cors = require('./middlewares/cors'),
    mongoose = require('mongoose'),
    config = require('config'),
    bodyParser = require('body-parser'),
    express = require('express'),
    passport = require('passport'),
    // session = require('express-session'),
    root = require('./routes/root');

if(!config.secret){
    console.log('Fatal Error!');
    process.exit(1);
}
app = express();
const isProduction = app.get('env') === 'production';

if(isProduction){
    mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
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

/* Middlewares */
//allow CORS
app.use(cors);
//Parse Request body with json payload
app.use(express.json());
// app.use(bodyParser);
//Parse request body with url-encoded payload
app.use(express.urlencoded({extended: true}));
// passport authentication
app.use(passport.initialize());
// app.use(passport.session());
//Allows serving static files
app.use(express.static('public'));
//Routing
app.use('/', root);

// app.use(session({ secret: 'testify', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }));

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
  
// development error handler
// will print stacktrace
if (!isProduction) {
    app.use(function(err, req, res, next) {
      console.log(err.stack);
  
      res.status(err.status || 500);
  
      res.json({'errors': {
        message: err.message,
        error: err
      }});
    });
  }
  
  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({'errors': {
      message: err.message,
      error: {}
    }});
  });
  

const port = process.env.PORT || 3000;
var server = app.listen(port, () => console.log(`Application Started! Listening on port ${server.address().port}`));