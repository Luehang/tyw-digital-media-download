const express               = require('express');
const router                = express.Router();
const passport              = require('passport');
const csrf                  = require('csurf');

// controllers
const userController        = require('../controllers/userController');
const profileController     = require('../controllers/profileController');
const productController     = require('../controllers/productController');

// user login authentication function
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    req.flash('error', 'Need to login in order to access.');
    res.redirect('/user/signin');
}

// user not log in function
function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

// middleware csrf protection
const csrfProtection = csrf();
router.use(csrfProtection);

/**
 * GET /user/profile
 *
 * Show user profile information, forms and settings.
 */
router.get('/profile', isLoggedIn, userController.getProfilePage);

/**
 * GET /user/orderhistory
 *
 * Show user history page.
 */
router.get('/orderhistory', isLoggedIn, 
    userController.getQueryOrder('user/orderhistory', 'Customer Orders', 10, 15));

/**
 * GET /user/update-profile
 * POST /user/update-profile
 *
 * Show user's profile information form.
 * After submission, it validates then create or update profile information.
 */
router.route('/update-profile')
    .get(isLoggedIn, profileController.getProfileUpdate)
    .post(isLoggedIn, profileController.postProfileUpdate);

/**
 * GET /user/products
 *
 * Show user's products.
 */
router.route('/products')
    .get(isLoggedIn, 
        productController.getQueryProduct('user/products', 'User Products', 10, 15, 'user')
    );

/**
 * GET /user/logout
 *
 * Log current user account.
 */
router.get('/logout', isLoggedIn, function (req, res, next) {
    req.logout();
    res.redirect('/');
});

router.use('/', notLoggedIn, function(req, res, next) {
    next();
});

/**
 * GET /user/signin
 * POST /user/signin
 *
 * Show signin form.
 * Submit and validate user.
 */
router.route('/signin')
    .get(userController.getSignInPage)
    .post(passport.authenticate('local.signin', {
            failureRedirect: '/user/signin',
            failureFlash: true
        }), userController.getSignInRedirect)

module.exports = router;
