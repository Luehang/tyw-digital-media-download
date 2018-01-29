const express               = require('express');
const router                = express.Router();
const csrf                  = require('csurf');
const csrfProtection        = csrf();

// controllers
const menuController        = require('../controllers/menuController');
const productController     = require('../controllers/productController');
const checkoutController    = require('../controllers/checkoutController');

// user login authentication function
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    req.flash('error', 'Need to login in order to access.');
    res.redirect('/user/signin');
}

/**
 * GET /
 *
 * Show home page.
 */
router.get('/', menuController.getHomePage);

/**
 * GET /products/:id
 *
 * Open and show individual product in one page.
 */
router.get('/products/:id', productController.getIndividualProduct);

const Product = require('../models/Product');
const Order = require('../models/Order');
/**
 * POST /download/:id
 *
 * Update download amount.
 */
router.route('/download/:id')
    .post(async (req, res) => {
        const productID = req.params.id;
        const downloadID = req.query.download;
        const [ product, order ] = await Promise.all([
            Product.update({_id: productID}, {$inc: {download: 1}}),
            Order.update({download_id: downloadID}, {$inc: {download: 1}})
        ]);
        res.end();
    })

/**
 * GET /checkout/:id
 * POST /checkout/:id
 * 
 * Show buy now check out form for submission.
 * Submit buy now check out form.
 */
router.route('/checkout/:id')
    .get(checkoutController.getIndividualProductCheckOut)
    .post(checkoutController.postIndividualProductCheckOut)


module.exports = router;
