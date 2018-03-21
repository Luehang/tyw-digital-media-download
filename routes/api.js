const express               = require('express');
const router                = express.Router();

// models
const Review                = require('../models/Review');

// controllers
const endPointController    = require('../controllers/endPointController');
const functionController    = require('../controllers/functionController');
const nearestHundredths     = functionController.nearestHundredths;

/**
 * GET /api/review-message/:id
 * POST /api/review-message/:id
 *
 * Review Message API endpoint.
 */
router.route('/review-message/:id')
    .get(async (req, res, next) => {
        const productID = req.params.id;
        try {
            // find product review and count
            const [ reviews, reviewCount ] = await Promise.all([
                Review.find({_product: productID}).sort({created_at: -1}).limit(50).lean().exec(),
                Review.count({})
            ]);
            // if no reviews
            if (reviewCount === 0) {
                res.json({
                    success: false,
                    message: "No content."
                });
            }
            // send respond with json
            if (req.accepts('json') && reviewCount !== 0) {
                res.json({
                    success: true,
                    message: "Reviews retrieved successfully.",
                    data: reviews
                });
            }
        } catch (err) {
            next(err);
        }
    })
    .post(async (req, res, next) => {
        const productID = req.params.id;
        const { userId, name, message } = req.body;
        const rating = Number.parseInt(req.body.rating);
        // if user login
        if (req.isAuthenticated()) {
            userId = req.user._id;
        }
        const review = new Review({
            _product: productID,
            userId,
            name,
            rating,
            percent_rating: nearestHundredths(rating * 20),
            message
        });
        try {
            // send review and send status
            review.save((err) => {
                if (err) {
                    console.log(err);
                    res.status(500);
                }
                res.status(201);
            });
        } catch(err) {
            res.status(500);
            next(err);
        }
    })

module.exports = router;