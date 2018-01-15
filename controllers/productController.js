'use strict';

const multer                = require('multer');
const path                  = require('path');

// node js
const fs                    = require('fs');

// models
const Product               = require('../models/Product');
const File                  = require('../models/File');
const Review                = require('../models/Review');
const Order                 = require('../models/Order');

// controllers
const functionController    = require('./functionController');
const nearestHundredths     = functionController.nearestHundredths;

const productController = {};

/**
 * GET /products/:id
 *
 * Open and show individual product in one page.
 */
productController.getIndividualProduct = async (req, res, next) => {
    const productID = req.params.id;
    const searchVal = req.query.search;
    const downloadID = req.query.download;
    let ratingTotal = null;
    let ratingAverage = null;
    let isDownload = null;
    // find product and product review data with count
    const [product, reviews, reviewCount, orderDownload] = await Promise.all([
        Product.findOne({_id: productID}).populate({path: '_seller', select: 'email company_name -_id'}).lean().exec(),
        Review.find({_product: productID}).lean().exec(),
        Review.count({_product: productID}),
        Order.findOne({download_id: downloadID, _product: productID}).lean().exec()
    ]);

    if (orderDownload) {
        isDownload = true;
    }

    if (reviewCount !== 0) {
        reviews.map((review) => {
            ratingTotal += review.rating;
        });
        ratingAverage = nearestHundredths(ratingTotal / reviewCount);
    }

    try {
        // store any messages in variables if any
        const messages = req.flash('error');
        const successMsg = req.flash('success');
        // Product.findByIdAndUpdate(productID, { $set: {
        //     rating: null
        // }}, {new: true}, (err, result) => {
        //     if (err) console.log(err);
        //     console.log(result);
        // });
        Product.findByIdAndUpdate(productID, { $set: {
            rating: ratingAverage
        }}, {new: true}, (err, result) => {
            if (err) console.log(err);
            return res.status(200).render('shop/product', {
                title: `${process.env.APP_NAME}: ${product.title}`,
                product: product,
                searchVal: searchVal,
                rating: result.rating,
                ratingAvg: ratingAverage,
                reviewCount: reviewCount,
                isDownload: isDownload,
                successMsg: successMsg,
                hasSuccess: successMsg.length > 0,
                messages: messages, 
                hasErrors: messages.length > 0
            });
        });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /user/account/add-product
 * 
 * Show add product form.
 */
productController.getAddProductForm = (req, res) => {
    res.render('user/add-product', {
        title: 'Add Products',
        update: false
    });
}

/**
 * DEPENDENCIES for Multer Upload
 * 
 * Settings and validation for uploading.
 */
// Set Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        const randomID = Math.random().toString(36).slice(2);
        cb(null,`${file.fieldname}-${Date.now()}-${randomID}${path.extname(file.originalname)}`);
    }
});
// Init Upload
const upload = multer({
    storage: storage,
    limits: {fileSize: 100000000}
}).single('imageFile');

/**
 * POST /user/account/add-product
 * 
 * MIDDLEWARE: Submission and validate image upload. 
 */
productController.postProductUploadMiddleware = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            req.session.error = err;
            return next();
        } else {
            // if no image upload
            if(req.file == undefined){
                req.session.image = false;
                next();
            // else if image upload
            } else {
                req.session.image = true;
                next();
            }
        }
    });
}

/**
 * POST /user/account/add-product
 * 
 * Validate and throw errors for product information if any. Then
 * throw any errors request from middleware. If validation passes,
 * then save information and redirect to user product page.
 */
productController.postProductUpload = (req, res) => {
    const { title, description, price, available } = req.body;
    // create product model
    const product = new Product({
        _seller: req.user._id,
        title: title,
        // if no image than defaults at
        // image_path: "/img/no-image.jpg",
        description: description,
        price: price,
        available: available
    });
    // if any image upload errors
    if (req.session.error) {
        req.flash('error', req.session.error);
        req.session.error = null;
        const errorMessages = req.flash('error');
        return res.status(400).render('user/add-product', {
            title: 'Add Products',
            update: false,
            messages: errorMessages, 
            hasErrors: errorMessages.length > 0,
            product: product
        });
    } else {
        const file = req.file;
        // if image upload
        if(req.session.image){
            req.session.image = null;
            // save image path to product model
            product.image_path = `/uploads/${file.filename}`;
            // create image model
            const file = new File({
                _user: req.user._id,
                originalname: file.originalname,
                encoding: file.encoding,
                mimetype: file.mimetype,
                destination: file.destination,
                filename: file.filename,
                path: `/uploads/${file.filename}`,
                size: file.size
            });
            // save product to db
            product.save((err, product) => {
                // save image to db
                file.save((err, image) => {
                    req.flash('success', 'Product added successfully.');
                    // redirect to account product page
                    return res.status(201).redirect('/user/products');
                }); 
            });
        // else if no image upload
        } else {
            req.session.image = null;
            // save product to db
            product.save((err, product) => {
                req.flash('success', 'Product added successfully.');
                // redirect to account product page
                return res.status(201).redirect('/user/products');
            });
        }
    }
}

/**
 * GET /user/account/update-product/:id
 * 
 * Show update product form of product selected.
 */
productController.getUpdateProductForm = (req, res) => {  
    const productID = req.params.id;
    // find product in db
    Product.findOne({_id: productID}, (err, product) => {
        if (err) {
            return res.redirect(req.url);
        }
        // render update product form
        res.status(200).render('user/add-product', {
            title: 'Update Product',
            update: true,
            product: product
        });
    });
}

/**
 * PUT /user/account/update-product/:id
 * 
 * Submit and validate product to be updated. Then delete old image and
 * upload new image if any.
 */
productController.putUpdateProductUpload = (req, res) => {
    const { title, description, price, available } = req.body;
    const productID = req.params.id;
    // if any image upload errors
    if (req.session.error) {
        // create product model
        const product = new Product({
            _seller: req.user._id,
            title: title,
            description: description,
            price: price,
            available: available
        });
        // store session error
        req.flash('error', req.session.error);
        req.session.error = null;
        const errorMessages = req.flash('error');
        return res.status(400).render('user/add-product', {
            title: 'Update Products',
            update: true,
            messages: errorMessages, 
            hasErrors: errorMessages.length > 0,
            product: product
        });
    // else if no image upload errors
    } else {
        const genFile = req.file;
        // if image upload
        if (req.session.image) {
            req.session.image = null;
            // create image model
            const file = new File({
                _user: req.user._id,
                originalname: genFile.originalname,
                encoding: genFile.encoding,
                mimetype: genFile.mimetype,
                destination: genFile.destination,
                filename: genFile.filename,
                path: `/uploads/${genFile.filename}`,
                size: genFile.size
            });
            // find product data
            Product.findOne({_id: productID}, async (err, oldProduct) => {
                // check if image exists 
                await fs.stat(`${__dirname}/../public${oldProduct.image_path}`, (err, stats) => {
                    if (err) {
                        return console.error(err);
                    }
                    // deletes image
                    fs.unlink(`${__dirname}/../public${oldProduct.image_path}`, function(err) {
                        if(err) return console.log(err);
                        // remove previous image data
                        File.remove({path: oldProduct.image_path});
                    });  
                });
                // save new image data
                await file.save();
                // update product in db
                await Product.update({_id: productID}, { $set: {
                    title: title,
                    description: description,
                    price: price,
                    available: available,
                    // update image path
                    image_path: `/uploads/${genFile.filename}`
                }}, {new: true});
            });
            // redirect to account product page
            req.flash('success', 'Product updated successfully.');
            res.status(201).redirect(`/products/${productID}`);
        // else if no image upload
        } else {
            req.session.image = null;
            // update product in db
            Product.update({_id: productID}, { $set: {
                title: title,
                description: description,
                price: price,
                available: available
            }}, {new: true}, (err, product) => {
                // redirect to account product page
                req.flash('success', 'Product updated successfully.');
                res.status(201).redirect(`/products/${productID}`);
            });
        }
    }
}

/**
 * GET /user/account/delete-product/:id
 * 
 * Show delete product form of selected.
 */
productController.getDeleteProductForm = (req, res) => {
    const productID = req.params.id;
    // find product in db
    Product.findOne({_id: productID}, (err, product) => {
        res.render('user/delete-product', {
            title: 'Delete Product',
            csrfToken: req.csrfToken(),
            product: product
        });
    });
}

/**
 * DELETE /user/account/delete-product/:id
 * 
 * Submit and validate product to be deleted permanently. Then delete 
 * product data, image data and actual image.
 */
productController.deleteProductPerm = (req, res) => {
    const productID = req.params.id;
    // find product data in db
    Product.findOne({_id: productID}, async (err, product) => {
        // check if image exists and deletes it
        await fs.stat(`${__dirname}/../public${product.image_path}`, (err, stats) => {
            if (err) {
                return console.error(err);
            }
            // delete image
            fs.unlink(`${__dirname}/../public${product.image_path}`, function(err) {
                if(err) return console.log(err);
            });  
        });
        // remove image data
        await File.remove({path: product.image_path});
        // remove product data in db
        await Product.remove({_id: productID});
    });
    // redirect to user products
    req.flash('success', "Successfully deleted product.")
    res.redirect('/user/products');
}

/**
 * GET /search-product
 * GET /user/products
 * GET /products
 *
 * Replace package "express-paginate."
 * Search input submission and display results with pagination.
 */
productController.getQueryProduct = (view, title, limit, maxLimit, queryParam) => {
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
                    query = {_seller: req.user};
                }
                if ((/^user/i).test(queryParam)) {
                    query = {_seller: req.user};
                }
            }
            // if (typeof queryParam === 'object') {
            //     query = queryParam;
            //     searchVal = queryParam;
            //     // const field = Object.keys(queryParam)[0];
            //     // searchVal = queryParam[field];
            // }
            // narrow down search in db and find total counts
            const [ results, itemCount ] = await Promise.all([
                Product.find(query)
                    .sort({created_at: -1})
                    .limit(req.query.limit)
                    .skip(Number.parseInt(req.query.skip) || req.skip)
                    .populate({
                        path: '_seller', 
                        select: 'email company_name -_id'
                    })
                    .lean()
                    .exec(),
                Product.count(query)
            ]);
            const pageCount = Math.ceil(itemCount / req.query.limit);
            
            // set up prev url
            const docBefore = req.query.limit * (req.query.page - 2);
            const hasPerviousPagesUrl = req.query.page > 1 ?
                `/search-product?search=${searchVal}&skip=${docBefore}&page=${req.query.page - 1}` 
                : null;   
            // set up next url
            const docNow = req.query.limit * req.query.page;
            const hasNextPagesUrl = pageCount > req.query.page ? 
                `/search-product?search=${searchVal}&skip=${docNow}&page=${req.query.page + 1}` 
                : null;
            // set up to reorganize data into groups
            const products = results;
            let productChunks = [];
            let chunkSize = 2;
            // organize data results into groups
            for (var i = 0; i < products.length; i += chunkSize) {
                productChunks.push(products.slice(i, i + chunkSize));
            }
            // store flash message in variables
            const successMsg = req.flash('success');
            const errorMessages = req.flash('error');
            // render view products
            res.status(200).render(view, {
                title: title,
                products: productChunks,
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

module.exports = productController;