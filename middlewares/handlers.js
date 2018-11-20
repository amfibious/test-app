
const cors = require('./middlewares/cors'),
    bodyParser = require('body-parser'),
    express = require('express'),
    passport = require('passport'),
    helmet = require('helmet'),
    compression = require('compression'),
    // session = require('express-session'),
    root = require('./routes/root');
    
const isProduction = app.get('env') === 'production';

module.exports = function(app){
      //------------------------------------------------------------------------------
      /* Middlewares */

      if(isProduction){
        app.use(helmet());
        app.use(compression());
      }
      //allow CORS
      app.use(cors);
      //Parse Request body with json payload
      app.use(express.json());
      // app.use(bodyParser);
      //Parse request body with url-encoded payload
      app.use(express.urlencoded({extended: true}));
      // passport authentication
      // app.use(passport.initialize());
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
      }