'use strict';

// models
const Product               = require('../models/Product');
const Profile               = require('../models/Profile');

// controllers

// set up menu object
const menuController = {};

/**
 * GET /
 *
 * Show home page.
 */
menuController.getHomePage = async (req, res, next) => {
    try {
        const [ profile, items ] = await Promise.all([
            Profile.findOne({user: req.user}).lean().exec(),
            Product.find({}).sort({order: 1}).lean().exec()
        ]);
        // store flash error and success in variables
        const messages = req.flash('error');
        const successMsg = req.flash('success');
        // store url for back history
        req.session.prev_url = req.url;
        // set up to reorganize data into groups
        const mainProduct = items.splice(0, 1);
        const products = items;
        // let productChunks = [];
        // let chunkSize = 2;
        // let count = 1;
        // // organize data results into groups
        // for (var i = 0; i < products.length; i += chunkSize) {
        //     let chunk = products.slice(i, i + chunkSize);
        //     chunk[0].count = count++;
        //     if (chunk[1]) chunk[1].count = count++;
        //     productChunks.push(chunk);
        // }
        // render index view page
        res.render('shop/index', { 
            title: process.env.APP_NAME, 
            mainProduct: mainProduct,
            products: products,
            successMsg: successMsg,
            hasSuccess: successMsg.length > 0,
            messages: messages, 
            hasErrors: messages.length > 0
        });
    } catch (err) {
        next(err);
    }
}

module.exports = menuController;

