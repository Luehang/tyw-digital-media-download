const express               = require('express');
const router                = express.Router();
const passport              = require('passport');
const csrf                  = require('csurf');

// controllers
const accountController        = require('../controllers/accountController');
const productController        = require('../controllers/productController');

// user login authentication function
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    req.flash('error', 'Need to login in order to access.');
    res.redirect('/user/signin');
}

// middleware csrf protection
const csrfProtection = csrf();

/**
 * GET /user/account/delete
 * DELETE /user/account/delete
 *
 * Show user account deletion form.
 * Submit deletion of user account.
 */
router.route('/delete')
    .get(csrfProtection, isLoggedIn, 
        accountController.getDeletePage)
    .delete(csrfProtection, isLoggedIn,
        passport.authenticate('local.signin', {
            failureRedirect: '/user/profile',
            failureFlash: true
    }), accountController.deleteAccount);

/**
 * GET /user/account/change-password
 * PUT /user/account/change-password
 * 
 * Show user change password form.
 * Submit password change.
 */
router.route('/change-password')
    .get(csrfProtection, isLoggedIn, 
        accountController.getChangePasswordPage)
    .put(csrfProtection, isLoggedIn,
        passport.authenticate('local.signin', {
            failureRedirect: '/user/account/change-password',
            failureFlash: true
    }), accountController.putPasswordChange);

/**
 * GET /user/account/add-product
 * POST /user/account/add-product
 * 
 * Show add product form.
 * Submit and validate product. Then upload image if any.
 */
router.route('/add-product')
    .get(isLoggedIn, productController.getAddProductForm)
    .post(isLoggedIn, productController.postProductUploadMiddleware, 
        productController.postProductUpload
    );

/**
 * GET /user/account/update-product/:id
 * PUT /user/account/update-product/:id
 * 
 * Show update product form of selected.
 * Submit and validate product to be updated. Then delete old image and
 * upload new image if any.
 */
router.route('/update-product/:id')
    .get(isLoggedIn, productController.getUpdateProductForm)
    .put(isLoggedIn, productController.postProductUploadMiddleware,
        productController.putUpdateProductUpload);

/**
 * GET /user/account/delete-product/:id
 * DELETE /user/account/delete-product/:id
 * 
 * Show delete product form of selected.
 * Submit and validate product to be deleted permanently. Then delete 
 * product data, image data and actual image.
 */
router.route('/delete-product/:id')
    .get(csrfProtection, isLoggedIn, productController.getDeleteProductForm)
    .delete(csrfProtection, isLoggedIn, productController.deleteProductPerm);

module.exports = router;