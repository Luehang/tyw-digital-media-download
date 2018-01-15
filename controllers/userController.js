'use strict';

const passport              = require('passport');
const bcrypt                = require('bcrypt-nodejs');
const request               = require('request');

// models
const Order                 = require('../models/Order');
const Profile               = require('../models/Profile');
const User                  = require('../models/User');

// set up user object
const userController = {};

/**
 * GET /user/orderhistory
 *
 * Show user history page.
 */
userController.getOrderHistoryPage = (req, res) => {
    // find order data
    Order.find({})
        .populate({
            path: '_product',
            select: 'title image_path'
        })
        .sort({purchase_date: -1})
        .limit(50)
        .exec((err, orders) => {
            // if database error
            if (err) {
                console.log(err);
            }
            // render order history
            res.render('user/orderhistory', { 
                orders: orders 
            });
        });
}

/**
 * GET /user/profile
 *
 * Show user profile information and settings.
 */
userController.getProfilePage = (req, res) => {
    // store flash message in variables
    const successMsg = req.flash('success');
    let messages = req.flash('error');
    // find profile data
    Profile.findOne({user: req.user}).populate({
        path: 'user',
        select: 'email -_id'
    }).then((userProfile) => {
        // render profile
        res.render('user/profile', {
            title: 'Profile',
            csrfToken: req.csrfToken(),
            userProfile: userProfile,
            successMsg: successMsg,
            hasSuccess: successMsg.length > 0,
            messages: messages,
            hasErrors: messages.length > 0
        });
    });
}

/**
 * GET /user/signin
 *
 * Show signin form.
 */
userController.getSignInPage = (req, res) => {
    // store flash messages in variable
    const messages = req.flash('error');
    // render sign in view page
    res.render('user/signin', {
        title: 'Sign In',
        csrfToken: req.csrfToken(), 
        messages: messages, 
        hasErrors: messages.length > 0
    });
}

/**
 * POST /user/signin
 *
 */
userController.getSignInRedirect = (req, res) => {
    if (req.session.oldUrl) {
        const oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/');
    }
}

module.exports = userController;