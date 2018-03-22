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
 * Replace package "express-paginate."
 * Query customer history and display results with pagination.
 */
userController.getQueryOrder = (view, title, limit, maxLimit, queryParam) => {
    var _limit = (typeof limit === 'number') ? parseInt(limit, 10) : 10;
    var _maxLimit = (typeof maxLimit === 'number') ? parseInt(maxLimit, 10) : 50;
    
    return async function _getQueryProduct(req, res, next) { 
        req.query.page = (typeof req.query.page === 'string') ? parseInt(req.query.page, 10) || 1 : 1;
        req.query.limit = (typeof req.query.limit === 'string') ? parseInt(req.query.limit, 10) || 0 : _limit;
        
        if (req.query.limit > _maxLimit)
                req.query.limit = _maxLimit;

        if (req.query.page < 1)
            req.query.page = 1;

        if (req.query.limit < 0)
            req.query.limit = 0;

            req.skip = req.offset = (req.query.page * req.query.limit) - req.query.limit;

            res.locals.paginate = {};
            res.locals.paginate.page = req.query.page;
            res.locals.paginate.limit = req.query.limit;
     
        try {
            // query data
            let query = {};
            let searchVal = "";
            if (typeof queryParam === 'string' || req.query.search) {
                if (req.query.search) {
                    queryParam = req.query.search;
                }
                if (queryParam === "") {
                    query = {};
                } else {
                    const regexSearch = new RegExp(`^${queryParam}`, "i");
                    query = {title: regexSearch};
                }
                searchVal = queryParam;
            }
            if (req.user) {
                if (req.query.search === req.user._id) {
                    query = {_user: req.user};
                }
                if ((/^user/i).test(queryParam)) {
                    query = {_user: req.user};
                }
            }
            // narrow down search in db and find total counts
            const [ results, itemCount ] = await Promise.all([
                Order.find(query)
                    .sort({purchase_date: 1})
                    .limit(req.query.limit)
                    .skip(Number.parseInt(req.query.skip) || req.skip)
                    .populate({
                        path: '_product',
                        select: 'title image_path'
                    })
                    .lean()
                    .exec(),
                Order.count(query)
            ]);
            const pageCount = Math.ceil(itemCount / req.query.limit);
            
            // set up prev url
            const docBefore = req.query.limit * (req.query.page - 2);
            const hasPerviousPagesUrl = req.query.page > 1 ?
                `/user/orderhistory?search=${searchVal}&skip=${docBefore}&page=${req.query.page - 1}` 
                : null;   
            // set up next url
            const docNow = req.query.limit * req.query.page;
            const hasNextPagesUrl = pageCount > req.query.page ? 
                `/user/orderhistory?search=${searchVal}&skip=${docNow}&page=${req.query.page + 1}` 
                : null;
            // store flash message in variables
            const successMsg = req.flash('success');
            const errorMessages = req.flash('error');
            // render view products
            res.status(200).render(view, {
                title: title,
                orders: results,
                pagination: req.query.page > 1 || pageCount > req.query.page,
                hasNextPagesUrl,
                hasPerviousPagesUrl,
                pageNumber: req.query.page,
                successMsg: successMsg,
                hasSuccess: successMsg.length > 0,
                messages: errorMessages, 
                hasErrors: errorMessages.length > 0
            });
        } catch (err) {
            next(err);
        }
    }
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
    const successMsg = req.flash('success');
    // render sign in view page
    res.render('user/signin', {
        title: 'Sign In',
        csrfToken: req.csrfToken(), 
        successMsg: successMsg,
        hasSuccess: successMsg.length > 0,
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
        res.redirect('/user/profile');
    }
}

module.exports = userController;