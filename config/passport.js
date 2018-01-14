const passport              = require('passport');
const LocalStrategy         = require('passport-local').Strategy;
const bcrypt                = require('bcrypt-nodejs');

// models
const User                  = require('../models/User');

// serialize user
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// deserialize user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

// sign in
passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    // first simple check up of email and password
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min: 5});
    // throw error if any
    const errors = req.validationErrors();
    if (errors) {
        let messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    // find user in db
    User.findOne({'email': email.toLowerCase(), 'is_deleted': false}, function (err, user) {
        if (err) {
            return done(err);
        }
        // if user not found throw error
        if (!user) {
            return done(null, false, {message: 'No user found.'});
        }
        // if password doesn't match throw error
        if (!user.validPassword(password)) {
            return done(null, false, {message: 'Wrong password.'});
        }
        return done(null, user);
    });
}));