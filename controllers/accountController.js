'use strict';

const bcrypt                = require('bcrypt-nodejs');

// models
const User                  = require('../models/User');
const Profile               = require('../models/Profile');

// set up delete object
const accountController = {};

/**
 * GET /user/account/delete
 *
 * Show user account deletion form.
 */
accountController.getDeletePage = (req, res) => {
    let title = null;
    let description = null;
    let stripe = false;
    if (req.query.type === 'user') {
        title = 'Delete Account';
        description = 'Please enter your email and password to delete your account or cancel.';
    }
    if (req.query.type === 'stripe') {
        title = 'Unlink Stripe';
        description = 'Please enter your email and password to unlink your Stripe account or cancel.';
        stripe = true;
    }
    // render delete account view page
    res.render('user/delete', {
        title: title,
        description: description,
        stripe: stripe,
        csrfToken: req.csrfToken()
    });
}

/**
 * DELETE /user/account/delete
 *
 * Submit deletion of user account.
 */
accountController.deleteAccount = (req, res) => {
    if (req.query.type === 'stripe') {
        return res.redirect('/user/stripe/deauthorize');
    }
    if (req.query.type === 'user') {
        // update user data
        User.update({_id: req.user._id}, { $set: {
            is_deleted: true
        }}, {new: true}, (err, user) => {
            // if database error
            if (err) {
                return res.redirect(req.url);
            }
            // update profile data
            Profile.update({user: req.user}, { $set: {
                is_deleted: true
            }}, {new: true}, (err, profile) => {
                // if database error
                if (err) {
                    return res.redirect(req.url);
                }
                // store message in flash
                req.flash('success', 'Account successfully deleted. Hope to see you again soon!');
                // log out of account
                req.logout();
                // redirect to home page
                return res.redirect('/');
            });
        });
    }
}

/**
 * GET /user/account/change-password
 * 
 * Show user change password form.
 */
accountController.getChangePasswordPage = (req, res) => {
    // store flash message in variable
    const messages = req.flash('error');
    // render change password view page
    res.render('user/change-password', {
        title: 'Change Password',
        csrfToken: req.csrfToken(),
        messages: messages, 
        hasErrors: messages.length > 0
    });
}

/**
 * POST /user/account/change-password
 *
 * Submission for password change.
 */
accountController.putPasswordChange = (req, res) => {
    // validate email and password
    req.checkBody('email', 'Invalid email.').notEmpty().isEmail();
    req.checkBody('newPassword', 'Invalid new password.').notEmpty();
    req.checkBody('newPassword', 'New password needs to be greater than 5 letters.').isLength({min: 5});
    // req.checkBody('newPassword', 'New password must contain a number.').matches(/\d/);
    // req.checkBody('newPassword', 'New password must contain a capitalized letter.').matches(/[A-Z]/);
    req.checkBody('newPasswordConfirmation', 'New passwords do not match.')
        .custom((value) => value === req.body.newPassword);
    // throw errors if any
    const errors = req.validationErrors();
    if (errors) {
        let messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        req.flash('error', messages);
        return res.redirect('/user/account/change-password');
    }
    User.findOne({'email': req.user.email}, (err, user) => {
        // if password matches throw error
        if (user.validPassword(req.body.newPassword)) {
            req.flash('error', 'New password can not be the same password.'); 
            return res.redirect('/user/account/change-password');
        }
        // find and update user data
        User.update({'email': req.user.email}, { $set: {
            password: bcrypt.hashSync(req.body.newPassword, bcrypt.genSaltSync(5), null)
        }}, {new: true}, (err, updatedUser) => {
            if (err) {
                console.log(err);
            }
            // store message in flash
            req.flash('success', 'Successfully changed password.');
            // redirect to profile
            return res.redirect('/user/profile');
        });
    });
}

module.exports = accountController;