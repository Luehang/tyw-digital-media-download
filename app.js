/**
 * Copyright 2017 All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const express               = require('express');
const path                  = require('path');
const favicon               = require('serve-favicon');
const logger                = require('morgan');
const cookieParser          = require('cookie-parser');
const bodyParser            = require('body-parser');
const expressHbs            = require('express-handlebars');
const mongoose              = require('mongoose');
const session               = require('express-session');
const passport              = require('passport');
const flash                 = require('connect-flash');
const validator             = require('express-validator');
const MongoStore            = require('connect-mongo')(session);
const methodOverride        = require('method-override');

// required for env vars
require('dotenv').config();

const app                   = express();

const hbs = expressHbs.create({
  // Specify helpers which are only registered on this instance.
  helpers: {
    helpers: {
    }
  }
});

// hide power for site
app.disable('x-powered-by');

// connect to database
mongoose.connect(process.env.DATABASE || 'mongodb://localhost/download-shop', 
{ useMongoClient: true });
const db = mongoose.connection;
db.on("open", function(ref) {
  console.log("Connected to mongo server.");
});
db.on("error", function(err) {
  console.log("Could not connect to mongo server.");
  console.error(err);
});

// require passport
require('./config/passport');

// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

// uncomment after placing favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// uncomment if in development mode
app.use(logger('dev'));

// for parsing application/json
app.use(bodyParser.json()); 
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.use(validator());

// use to parse cookie
app.use(cookieParser());

// settings for session
app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false, 
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 180 * 60 * 1000 } // 3 hours
}));

// use flash to handle messages from back end
app.use(flash());

// initialize Passport and restore any existing authentication state.
app.use(passport.initialize());
app.use(passport.session());

// set up and use public files
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  // middleware authenticate user and store in locals
  res.locals.login = req.isAuthenticated();
  res.locals.APP_NAME = process.env.APP_NAME;
  res.locals.APP_URL = process.env.APP_URL;
  res.locals.PAYPAL_SANDBOX_KEY = process.env.PAYPAL_SANDBOX_KEY;
  res.locals.PAYPAL_PRODUCTION_KEY = process.env.PAYPAL_PRODUCTION_KEY;
  res.locals.STRIPE_PUB_KEY = process.env.STRIPE_PUB_KEY;
  res.locals.GOOGLE_TRACKING_ID = process.env.GOOGLE_TRACKING_ID;
  // store session in local session
  res.locals.session = req.session;
  next();
});

// override methods for form method
app.use(methodOverride('_method'));

// routes
app.use('/user/account', require('./routes/account'));
app.use('/user', require('./routes/user'));
app.use('/api', require('./routes/api'));
app.use('/', require('./routes/index'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
