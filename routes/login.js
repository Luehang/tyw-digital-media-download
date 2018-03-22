const express               = require('express');
const router                = express.Router();
const passport              = require('passport');
const csrf                  = require('csurf');
const sgMail                = require('@sendgrid/mail');

// models
const User                  = require('../models/User');

// controllers
const functionController    = require('../controllers/functionController');
const randomString          = functionController.randomString;

// middleware csrf protection
const csrfProtection = csrf();

/**
 * GET /login/reset-password
 * POST /login/reset-password
 *
 * 
 */
router.route('/reset-password')
    .get(async (req, res, next) => {
        let sendReset = false;
        let receiveReset = false;
        let passwordResetToken = null;
        try {
            // if send reset query type
            if (req.query.type == "send-reset") {
                sendReset = true;
            }
            // if receive reset query type
            if (req.query.type == "receive-reset") {
                // validate password reset token
                const user = await User.findOne({password_reset_token: req.query.password_reset_token});
                // if invalid password reset token then redirect
                if (!user) {
                    req.flash('error', 'Invalid Url Address.');
                    sendReset = true;
                }
                // store password reset token
                passwordResetToken = user.password_reset_token;
                receiveReset = true;
                // generate random csrf token and store in session
                // req.session.csrfToken = randomString(3);
            }
        } catch(err) {
            console.log(err);
            next(err);
        }
        // store any messages in variables if any
        const messages = req.flash('error');
        res.render('user/reset-password', {
            title: 'Reset Password',
            csrfToken: req.session.csrfToken,
            sendReset,
            receiveReset,
            passwordResetToken,
            messages: messages, 
            hasErrors: messages.length > 0
        });
    })
    .post((req, res, next) => {
        const email = req.body.email;
        try {
            // if send reset query type
            if (req.query.type == "send-reset") {
                // generate random password reset token
                const passwordResetToken = randomString(4);
                // find, update and validate user email
                User.update({email: email}, { $set: {
                    password_reset_token: passwordResetToken
                }}, {new: true}, (err, user) => {
                    let sendReset = false;
                    let sendConfirm = false;
                    let foundEmail = null;
                    // if user email not found
                    if (!user) {
                        req.flash('error', 'Invalid Email Address.');
                        sendReset = true;
                    } 
                    // if user email found
                    if (user) {
                        foundEmail = user.email;
                        sendConfirm = true;
                        // url for password reset
                        const passwordResetUrl = `${process.env.APP_URL}/login` +
                            `/reset-password?type=receive-reset` +
                            `&password_reset_token=${passwordResetToken}`;
                        // send password reset email
                        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                        const passwordResetEmail = {
                            to: user.email,
                            from: process.env.SENDGRID_TO_EMAIL,
                            subject: `${process.env.APP_NAME.toUpperCase()}: Password Reset`,
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
                                    <div class="x_mark" style="text-align:center; padding:25px 0 17px;"><a href="${process.env.APP_URL}" target="_blank" style="text-align:center; color:#4183C4; text-decoration:none"><div style="display: inline-block; max-width: 99.9%;"><img src="${process.env.APP_URL}/favicon.ico" alt="${process.env.APP_NAME}, Inc." width="102" height="28" class="x_center x_logo-wordmark" style="outline:none; text-decoration:none; width:auto; max-width:100%; border:none; margin:0 auto; float:none; text-align:center"></div>   ${process.env.APP_NAME}</a></div>
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
                                    Password Reset</h2>
                                    <h3 class="x_content-heading" style="color:#333; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; font-weight:300; padding:0; margin:25px 0 20px; text-align:center; line-height:1; word-break:normal; font-size:16px">
                                    Reset for <a>${email}</a></h3>
                                    <p>Hi <a>${email}</a>, <br>As you have requested for reset password instructions, here they are, please follow the URL:</p>
                                    <div class="x_cta-button-wrap" style="padding:30px 0 20px; text-align:center; color:#ffffff">
                                    <a href="${passwordResetUrl}" target="_blank" style="color:#ffffff; text-decoration:none; display:inline-block; text-align:center; background:#23b5f7; background-color:#23b5f7; border-radius:5px; -webkit-border-radius:5px; padding:12px 44px; font-weight:bold; letter-spacing:normal; font-size:17px; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; margin:0 auto; width:auto!important">PASSWORD RESET</a></div>
                                    <p>Alternatively, open the following url in your browser:  <br><a>${passwordResetUrl}</a></p>
                                    </div>
                                    </td>                  
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
                        sgMail.send(passwordResetEmail).then(() => {
                            // store any messages in variables if any
                            const messages = req.flash('error');
                            return res.render('user/reset-password', {
                                title: 'Reset Password',
                                sendReset: sendReset,
                                sendConfirm: sendConfirm,
                                email: foundEmail,
                                messages: messages, 
                                hasErrors: messages.length > 0
                            });
                        });
                    }
                });
            }
        } catch(error) {
            console.log(error);
            next(error);
        }
    })
    .put((req, res, next) => {
        // if receive reset query type and validate csrfToken
        // req.session.csrfToken == req.body.csrfToken
        if (req.query.type = 'receive-reset') {
                // validate password reset token
                User.findOne({password_reset_token: req.query.password_reset_token}, (err, user) => {
                    if (err) {
                        console.log(err);
                        next(err);
                    }
                    if (!user) {
                        req.flash('error', 'Invalid Url Address.');
                        return res.redirect('/login/reset-password?type=send-reset');
                    }
                    // then reset password change
                    // validate password
                    req.checkBody('newPassword', 'Invalid new password.').notEmpty();
                    req.checkBody('newPassword', 'New password needs to be greater than 5 letters.').isLength({min: 5});
                    req.checkBody('newPassword', 'New password must contain a number.').matches(/\d/);
                    req.checkBody('newPassword', 'New password must contain a capitalized letter.').matches(/[A-Z]/);
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
                        return res.redirect(`/login${req.url}`);
                    }
                    // if password matches throw error
                    if (user.validPassword(req.body.newPassword)) {
                        req.flash('error', 'New password can not be the same password.'); 
                        return res.redirect(`/login${req.url}`);
                    }
                    // find and update user data
                    User.update({email: user.email}, { $set: {
                        password: User.encryptPassword(req.body.newPassword),
                        password_reset_token: null
                    }}, {new: true}, (err, updatedUser) => {
                        if (err) {
                            console.log(err);
                        }
                        // store message in flash
                        req.flash('success', 'Successfully changed password.');
                        // redirect to sign in
                        return res.redirect('/user/signin');
                    });
                });
        } else {
            req.flash('error', 'Invalid Url Address.');
            return res.redirect('/login/reset-password?type=send-reset');
        }
    })

module.exports = router;