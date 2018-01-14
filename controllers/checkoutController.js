'use strict';

const sgMail                = require('@sendgrid/mail');

// models
const Product               = require('../models/Product');
const Order                 = require('../models/Order');
const User                  = require('../models/User');
const Profile               = require('../models/Profile');

// controllers
const functionController    = require('./functionController');
const nearestHundredths     = functionController.nearestHundredths;

const checkoutController = {};

/**
 * GET /checkout/:id
 * 
 * Show buy now check out form for submission.
 */
checkoutController.getIndividualProductCheckOut = (req, res) => {
    const productID = req.params.id;
    // find product data
    Product.findOne({_id: productID})
        .then((product) => {
            const messages = req.flash('error');
            // store url needed for when clicking update info button in view
            req.session.oldUrl = req.url;
            // render check out page
            res.render('shop/buy-now-checkout', {
                title: 'Buy Now Check Out',
                messages: messages, 
                hasErrors: messages.length > 0,
                product: product
            });
        });
}

/**
 * POST /checkout/:id
 * 
 * Submit buy now check out form.
 */
checkoutController.postIndividualProductCheckOut = async (req, res, next) => {
    // Set your secret key: remember to change this to your live secret key in production
    // See your keys here: https://dashboard.stripe.com/account/apikeys
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    // Set Stripe’s API version in library to avoid potentially breaking changes for users
    stripe.setApiVersion(process.env.STRIPE_API_VERSION);
    // Token is created using Checkout or Elements!
    // Get the payment token ID submitted by the form:
    const { stripeToken, name, email } = req.body;
    const productID = req.params.id;
    const [ downloadID, orderID, product ] = await Promise.all([
        randomString(3),
        randomString(2),
        Product.findOne({_id: productID, is_deleted: false}).lean().exec()
    ]);
    const downloadUrl = `${process.env.APP_URL}/products/${productID}?download=${downloadID}`;
    // if product not found
    if (product === null) {
        req.flash('error', 'Invalid product id.');
        return res.redirect('/');
    }
    const itemPrice = nearestHundredths(product.price * 100); // price in cents
    // create order 
    const order = new Order({
        download_id: downloadID,
        order_id: orderID,
        name,
        email,
        _product: product._id,
        amount: product.price
    });

    try {
        await Product.update({_id: productID}, {$inc: {
            sold: 1
        }});
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: email,
            from: process.env.SENDGRID_TO_EMAIL,
            subject: `${process.env.APP_NAME.toUpperCase()}: ${product.title} Download`,
            // text: '',
            html: `<table style="background:#fafafa;width:100%;">
                        <tbody>
                    <tr style="padding:0; vertical-align:top; text-align:center;">
                    <td class="x_center" align="center" valign="top" style="word-break:break-word; padding:0; vertical-align:top; text-align:center; color:#333333; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-weight:normal; margin:0; line-height:20px; font-size:14px; border-collapse:collapse!important">
                    <center style="width:100%; min-width:580px">
                    <table class="x_row x_header" style="border-spacing:0; border-collapse:collapse; padding:0px; vertical-align:top; text-align:center; width:100%;">
                    <tbody>
                    <tr style="padding:0; vertical-align:top; text-align:center">
                    <td class="x_center" align="center" style="word-break:break-word; padding:0; vertical-align:top; text-align:center; color:#333333; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-weight:normal; margin:0; line-height:20px; font-size:14px; border-collapse:collapse!important">
                    <center style="width:100%; min-width:580px">
                    <table class="x_container" style="border-spacing:0; border-collapse:collapse; padding:0; vertical-align:top; text-align:inherit; width:580px; margin:0 auto">
                    <tbody>
                    <tr style="padding:0; vertical-align:top; text-align:center">
                    <td class="x_wrapper x_last" style="word-break:break-word; padding:0; vertical-align:top; text-align:center; color:#333333; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-weight:normal; margin:0; line-height:20px; font-size:14px; padding-right:0px; border-collapse:collapse!important">
                    <table class="x_twelve x_columns" style="border-spacing:0; border-collapse:collapse; padding:0; vertical-align:top; text-align:center; margin:0 auto; width:580px">
                    <tbody>
                    <tr style="padding:0; vertical-align:top; text-align:center">
                    <td style="word-break:break-word; padding:0px 0px 10px; vertical-align:top; text-align:center; color:#333333; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-weight:normal; margin:0; line-height:20px; font-size:14px; border-collapse:collapse!important">
                    <div class="x_mark" style="text-align:center"><a href="${process.env.APP_URL}" target="_blank" style="text-align:center; color:#4183C4; text-decoration:none"><div style="display: inline-block; max-width: 99.9%;"><img src="http://www.iconsdb.com/icons/preview/caribbean-blue/infinity-xxl.png" alt="${process.env.APP_NAME}, Inc." width="102" height="28" class="x_center x_logo-wordmark" style="outline:none; text-decoration:none; width:auto; max-width:100%; border:none; margin:0 auto; float:none; padding:25px 0 17px; text-align:center"></div> </a></div>
                    </td>
                    <td class="x_expander" style="word-break:break-word; padding:0!important; vertical-align:top; text-align:center; color:#333333; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-weight:normal; margin:0; line-height:20px; font-size:14px; visibility:hidden; width:0px; border-collapse:collapse!important">
                    </td>
                    </tr>
                    </tbody>
                    </table>
                    </td>
                    </tr>
                    </tbody>
                    </table>
                    </center>
                    </td>
                    </tr>
                    </tbody>
                    </table>
                    <table class="x_container" style="border-spacing:0; border-collapse:collapse; padding:0; vertical-align:top; text-align:inherit; width:580px; margin:0 auto">
                    <tbody>
                    <tr style="padding:0; vertical-align:top; text-align:center; border:1px solid #dddddd; border-radius:3px; background:#fff;">
                    <td style="word-break:break-word; padding:10px; vertical-align:top; text-align:center; color:#333333; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-weight:normal; margin:0; line-height:20px; font-size:14px; border-collapse:collapse!important">
                    <table class="x_row" style="border-spacing:0; border-collapse:collapse; padding:0px; vertical-align:top; text-align:center; width:100%; display:block">
                    <tbody>
                    <tr style="padding:0; vertical-align:top; text-align:center">
                    <td class="x_wrapper x_last" style="word-break:break-word; padding:0; vertical-align:top; text-align:center; color:#333333; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-weight:normal; margin:0; line-height:20px; font-size:14px; padding-right:0px; border-collapse:collapse!important">
                    <table class="x_twelve x_columns" style="border-spacing:0; border-collapse:collapse; padding:0; vertical-align:top; text-align:center; margin:0 auto; width:580px">
                    <tbody>
                    <tr style="padding:0; vertical-align:top; text-align:center">
                    <td class="x_no-padding" style="word-break:break-word; padding:0; vertical-align:top; text-align:center; color:#333333; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-weight:normal; margin:0; line-height:20px; font-size:14px; border-collapse:collapse!important">
                    <div class="x_hero-image-wrap" style="overflow:hidden; border-radius:3px 3px 0 0">
                    <a href="${process.env.APP_URL}" target="_blank" style="color:#4183C4; text-decoration:none"><div style="display: inline-block; max-width: 99.9%;"><img src="https://tywmedia.worldsecuresystems.com/TYW-Digital-Media-NEW-CIRCLE-logo-720x480.jpg" alt="${process.env.APP_NAME}" border="0" class="x_hero-image" style="margin:0; padding:0; outline:none; text-decoration:none; height:200px; max-width:100%; border:none; display:block"></div> </a></div>
                    </td>
                    <td class="x_expander" style="word-break:break-word; padding:0!important; vertical-align:top; text-align:center; color:#333333; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-weight:normal; margin:0; line-height:20px; font-size:14px; visibility:hidden; width:0px; border-collapse:collapse!important">
                    </td>
                    </tr>
                    </tbody>
                    </table>
                    <div class="x_panel" style="background:#ffffff; background-color:#ffffff;padding:0 20px 20px;width:538px">
                    <table class="x_twelve x_columns x_panel-contents" style="border-spacing:0; border-collapse:collapse; padding:0; vertical-align:top; text-align:center; margin:0 auto; width:540px">
                    <tbody>
                    <tr style="padding:0; vertical-align:top; text-align:center">
                    <td style="word-break:break-word; padding:0px 0px 10px; vertical-align:top; text-align:center; color:#333333; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-weight:normal; margin:0; line-height:20px; font-size:14px; border-collapse:collapse!important">
                    <div class="x_content">
                    <h2 class="x_content-heading" style="color:#333; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-weight:300; padding:0; margin:25px 0 20px; text-align:center; line-height:1; word-break:normal; font-size:22px">
                    ${product.title} Download</h2>
                    <h3 class="x_content-heading" style="color:#333; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-weight:300; padding:0; margin:25px 0 20px; text-align:center; line-height:1; word-break:normal; font-size:16px">
                    Order Summary for ${name}</h3>
                    <p>Payment total of $${priceToCompleteString(product.price)} received on ${returnDateTime(new Date())}</p>
                    <div class="x_cta-button-wrap" style="padding:30px 0 20px; text-align:center; color:#ffffff">
                    <a href="${downloadUrl}" target="_blank" style="color:#ffffff; text-decoration:none; display:inline-block; text-align:center; background:#23b5f7; background-color:#23b5f7; border-radius:5px; -webkit-border-radius:5px; padding:12px 44px; font-weight:bold; letter-spacing:normal; font-size:17px; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; margin:0 auto; width:auto!important">DOWNLOAD</a></div>
                    </div>
                    </td>
                    <td class="x_expander" style="word-break:break-word; padding:0!important; vertical-align:top; text-align:center; color:#333333; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-weight:normal; margin:0; line-height:20px; font-size:14px; visibility:hidden; width:0px; border-collapse:collapse!important">
                    </td>
                    </tr>
                    </tbody>
                    </table>
                    </div>
                    </td>
                    </tr>
                    </tbody>
                    </table>
                    </td>
                    </tr>
                    </tbody>
                    </table>
                    <table class="x_row x_layout-footer" style="border-spacing:0; border-collapse:collapse; padding:0px; vertical-align:top; text-align:center; width:100%">
                    <tbody>
                    <tr style="padding:0; vertical-align:top; text-align:center">
                    <td class="x_center" align="center" style="word-break:break-word; padding:0; vertical-align:top; text-align:center; color:#333333; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-weight:normal; margin:0; line-height:20px; font-size:14px; border-collapse:collapse!important">
                    <center style="width:100%; min-width:580px">
                    <table class="x_container" style="border-spacing:0; border-collapse:collapse; padding:0; vertical-align:top; text-align:inherit; width:580px; margin:0 auto">
                    <tbody>
                    <tr style="padding:0; vertical-align:top; text-align:center">
                    <td class="x_wrapper x_last" style="word-break:break-word; padding:0; vertical-align:top; text-align:center; color:#333333; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-weight:normal; margin:0; line-height:20px; font-size:14px; padding-right:0px; border-collapse:collapse!important">
                    <table class="x_twelve x_columns" style="border-spacing:0; border-collapse:collapse; padding:0; vertical-align:top; text-align:center; margin:0 auto; width:580px">
                    <tbody>
                    <tr style="padding:0; vertical-align:top; text-align:center">
                    <td style="word-break:break-word; padding:0px 0px 10px; vertical-align:top; text-align:center; color:#333333; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-weight:normal; margin:0; line-height:20px; font-size:14px; border-collapse:collapse!important">
                    <div class="x_footer-links" style="padding:20px 0; text-align:center">
                    <p class="x_footer-text" style="margin:0; word-wrap:normal; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-size:12px; font-weight:normal; color:#999; line-height:20px; padding:0; text-align:center">
                    <a href="#" target="_blank" style="color:#2d99bb; text-decoration:none">Terms</a> • <a href="#" target="_blank" style="color:#2d99bb; text-decoration:none">Privacy</a></p>
                    </div>
                    <div class="x_content" style="margin:0 0 15px 0"><a href="#" target="_blank" style="color:#4183C4; text-decoration:none"><div style="display: inline-block; max-width: 99.9%;"><img src="https://ih1.redbubble.net/image.197984217.2529/ap,550x550,12x12,1,transparent,t.u2.png" class="x_logo-invertocat" width="40" height="38" style="outline:none; text-decoration:none; width:auto; max-width:100%; border:none"></div> </a></div>
                    <div class="x_content" style="margin:0 0 15px 0">
                    <p class="x_footer-text" style="margin:0; word-wrap:normal; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-size:12px; font-weight:normal; color:#999; line-height:20px; padding:0; text-align:center">
                    ${process.env.APP_NAME}, Inc.</p>
                    <p class="x_footer-text" style="margin:0; word-wrap:normal; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-size:12px; font-weight:normal; color:#999; line-height:20px; padding:0; text-align:center">
                    ${process.env.APP_URL}<span tabindex="0" role="button" class="contextualExtensionHighlight ms-font-color-themePrimary ms-border-color-themePrimary ident_5621_5651"></span><br><span tabindex="0" role="button" class="contextualExtensionHighlight ms-font-color-themePrimary ms-border-color-themePrimary ident_5621_5651">
                    United States</span></p>
                    </div>
                    </td>
                    <td class="x_expander" style="word-break:break-word; padding:0!important; vertical-align:top; text-align:center; color:#333333; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-weight:normal; margin:0; line-height:20px; font-size:14px; visibility:hidden; width:0px; border-collapse:collapse!important">
                    </td>
                    </tr>
                    </tbody>
                    </table>
                    </td>
                    </tr>
                    </tbody>
                    </table>
                    </center>
                    </td>
                    </tr>
                    </tbody>
                    </table>
                    </center>
                    </td>
                    </tr>
                    </tbody>
                    </table>`
        };
        sgMail.send(msg).then(() => {
            if (stripeToken) {
                // create charge and fund transfer
                // Stripe's direct charges approach
                const charge = stripe.charges.create({
                    amount: itemPrice, // cents
                    currency: "usd",
                    description: `${process.env.APP_NAME} - ${product.title}`,
                    statement_descriptor: process.env.APP_NAME,
                    metadata: {
                        order_id: orderID
                    },
                    source: stripeToken
                }).then((charge) => {
                    // save the Stripe charge reference
                    order.stripe_charge_id = charge.id;
                    order.save();
                    // store message in flash
                    req.flash('success', 'Your payment was successful. Please check your email for the link to the download.');
                    // redirect to home page
                    return res.redirect(downloadUrl);
                });
            }
            order.save();
            // store message in flash
            req.flash('success', 'Your payment was successful. Please check your email for the link to the download.');
            // redirect to home page
            return res.redirect(downloadUrl);
        }).catch(error => {
            if(error.code === 400) {
                // store message in flash
                req.flash('error', 'Your order was unsuccessful. Invalid E-mail. Please try again.');
                // redirect to home page
                return res.redirect(`/checkout/${productID}`);
            }
            console.error(error.message);
            // store message in flash
            req.flash('error', `Your order was unsuccessful. Please try again.`);
            // redirect to home page
            return res.redirect(`/checkout/${productID}`);
        });
    } catch(err) {
        console.log(err);
        // return a 402 Payment Required error code
        res.sendStatus(402);
        next(`Error adding token to customer: ${err.message}`);
    }

    // if (req.query.checkout === "card") {

    // }
    // if (req.query.checkout === "default") {

    // }
}

function returnDateTime(ISOdate) {
    let date = new Date(ISOdate);
    let hours = date.getHours();
    let mins = date.getMinutes().toString();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let year = date.getFullYear();
    let time = "";
    if (mins.length === 1) {
        mins = "0" + mins;
    }
    if (hours >= 13) {
        hours = hours - 12;
        time = `${month}/${day}/${year} at ${hours}:${mins} PM`;
    } else if (hours === 0) {
        hours = 12;
        time = `${month}/${day}/${year} at ${hours}:${mins} AM`;
    } else {
        time = `${month}/${day}/${year} at ${hours}:${mins} AM`;
    }
    return time;
}

function randomString(num) {
    let string = "";
    for (var i = 0; i < num; i++) {
        string += Math.random().toString(36).substring(2);
    }
    return string;
}

/**
 * Function to change price to string ex. "2.00"
 *
 */
function priceToCompleteString(number) {
    let newString = number.toString();
    if ((/\./).test(newString) !== true) {
        return newString + ".00";
    }
    const startIndex = newString.match(/\./).index + 1;
    const decimalPlace = newString.substring(startIndex, newString.length);
    if (decimalPlace.length === 1) {
        return newString + "0";
    } else {
        return newString;
    }
}

module.exports = checkoutController;