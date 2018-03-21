'use strict';

const multer                = require('multer');
const path                  = require('path');

// node js
const fs                    = require('fs');

// models
const Product               = require('../models/Product');
const Download              = require('../models/Download');
const Review                = require('../models/Review');
const Order                 = require('../models/Order');

// controllers
const functionController    = require('./functionController');
const nearestHundredths     = functionController.nearestHundredths;
const isCurrency            = functionController.isCurrency;
const randomString          = functionController.randomString;
const queryUrl              = functionController.queryUrl;

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
    let ratingPercentAverage = null;
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
        ratingPercentAverage = nearestHundredths(ratingAverage * 20);
    }

    try {
        // store any messages in variables if any
        const messages = req.flash('error');
        const successMsg = req.flash('success');
        // store previous url
        const backUrl = req.session.prev_url;
        // Product.findByIdAndUpdate(productID, { $set: {
        //     rating: null
        // }}, {new: true}, (err, result) => {
        //     if (err) console.log(err);
        //     console.log(result);
        // });
        Product.findByIdAndUpdate(productID, { $set: {
            rating: ratingAverage,
            percent_rating: ratingPercentAverage
        }}, {new: true}, (err, result) => {
            if (err) console.log(err);
            return res.status(200).render('shop/product', {
                title: `${process.env.APP_NAME}: ${product.title}`,
                product: product,
                searchVal: searchVal,
                backUrl: backUrl,
                rating: result.rating,
                ratingAvg: ratingAverage,
                percent_rating: ratingPercentAverage,
                reviewCount: reviewCount,
                isDownload: isDownload,
                downloadID: downloadID,
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
    // generate random csrf token and store in session
    const csrfToken = randomString(3);
    req.session.csrfToken = csrfToken;
    // store any messages in variables if any
    const messages = req.flash('error');
    res.render('user/add-product', {
        title: 'Add Products',
        csrfToken: csrfToken,
        update: false,
        messages: messages, 
        hasErrors: messages.length > 0
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
    limits: {fileSize: 500000000}
}).fields([
    { name: 'imageFile', maxCount: 1 },
    { name: 'downloadFile', maxCount: 1 }
]);

/**
 * POST /user/account/add-product
 * 
 * MIDDLEWARE: Submission and validate image upload. 
 */
productController.postProductUploadMiddleware = (req, res, next) => {
    upload(req, res, (err) => {
        // csrf protection
        if (req.session.csrfToken !== req.body.csrfToken) {
            return res.end();
        }
        req.session.csrfToken = null;
        const { title, description, price, order, video_url } = req.body;
        const isUpdate = req.body.isUpdate === "true" ? true : false;
        // if no title
        if (title === "") {
            req.flash('error', 'Need to add a product title.');
            return res.redirect('/user/account/add-product');
        }
        // if not currency
        if (!isCurrency(price)) {
            req.flash('error', 'Product price needs to be formatted in USD currency. Ex. 99.90');
            return res.redirect('/user/account/add-product');
        }
        // if item order not integer
        if (!(/^[0-9]+$/).test(order) && order !== "") {
                req.flash('error', 'Item order has to be an integer.');
                return res.redirect('/user/account/add-product');
        }
        if (err) {
            console.log(err);
            req.session.error = err;
            return next();
        } else {
            // if update has only download upload
            if(req.files.imageFile === undefined && 
                req.files.downloadFile !== undefined 
                && isUpdate) {
                    req.session.imageUpload = false;
                    req.session.downloadUpload = true;
                    return next();
            }
            // if update has only image upload
            if(req.files.imageFile !== undefined && 
                req.files.downloadFile === undefined
                && isUpdate) {
                    req.session.imageUpload = true;
                    req.session.downloadUpload = false;
                    return next();
            }
            // if update has image and download upload
            if(req.files.imageFile !== undefined && 
                req.files.downloadFile !== undefined
                && isUpdate) {
                    req.session.imageUpload = true;
                    req.session.downloadUpload = true;
                    return next();
            }
            // if update has no file upload
            if(req.files.imageFile === undefined && 
                req.files.downloadFile === undefined
                && isUpdate) {
                    req.session.imageUpload = false;
                    req.session.downloadUpload = false;
                    return next();
            }
            // if adding product with no errors
            return next();
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
productController.postProductUpload = async (req, res) => {
    const { title, description, price, order, video_url } = req.body;
    // create product model
    const product = new Product({
        _user: req.user,
        title,
        description,
        price,
        order
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
    }

    try {
        const updateVideoUrl = await Promise.all([
            queryUrl(video_url)
        ]);
        const downloadFile = req.files.downloadFile[0];
        // add download path to product model
        product.download_path = `/uploads/${downloadFile.filename}`;
        product.video_url = updateVideoUrl;
        // create download model
        const image = new Download();
        // if there is image file upload
        if (req.files.imageFile) {
            const imageFile = req.files.imageFile[0];
            // add image path to product model
            product.image_path = `/uploads/${imageFile.filename}`;
            // add image details to image download model
            image._user = req.user._id;
            image.originalname = imageFile.originalname;
            image.encoding = imageFile.encoding;
            image.mimetype = imageFile.mimetype;
            image.destination = imageFile.destination;
            image.filename = imageFile.filename;
            image.path = `/uploads/${imageFile.filename}`;
            image.size = imageFile.size;
        }
        const download = new Download({
            _user: req.user._id,
            originalname: downloadFile.originalname,
            encoding: downloadFile.encoding,
            mimetype: downloadFile.mimetype,
            destination: downloadFile.destination,
            filename: downloadFile.filename,
            path: `/uploads/${downloadFile.filename}`,
            size: downloadFile.size
        });
        // save product to db
        await product.save();
        // save image to db
        await image.save();
        // save download to db
        await download.save();
        req.flash('success', 'Product added successfully.');
        // redirect to account product page
        res.status(201).redirect('/user/products');
    } catch (err) {
        console.log(err);
        next();
    }
}

/**
 * GET /user/account/update-product/:id
 * 
 * Show update product form of product selected.
 */
productController.getUpdateProductForm = (req, res) => {  
    const productID = req.params.id;
    // generate random csrf token and store in session
    const csrfToken = randomString(3);
    req.session.csrfToken = csrfToken;
    // find product in db
    Product.findOne({_id: productID}, (err, product) => {
        if (err) {
            return res.redirect(req.url);
        }
        if (product.video_url) {
            product.video_url = product.video_url.split("?").shift();
        }
        // render update product form
        res.status(200).render('user/add-product', {
            title: 'Update Product',
            csrfToken: csrfToken,
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
productController.putUpdateProductUpload = async (req, res, next) => {
    const { title, description, price, order, video_url } = req.body;
    const productID = req.params.id;
    // if any image upload errors
    if (req.session.error) {
        // create product model
        const product = new Product({
            _user: req.user,
            title,
            description,
            price,
            order
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
    }
    try {
        let imageFile;
        let downloadFile;
        const image = new Download();
        const download = new Download();
        const [oldProduct, updateVideoUrl] = await Promise.all([
            Product.findOne({_id: productID}).lean().exec(),
            queryUrl(video_url)
        ]);
        await Product.update({_id: productID}, { $set: {
            title: title,
            description: description,
            price: price,
            order: order,
            video_url: updateVideoUrl,
            updated_at: new Date()
        }}, {upsert: true});
        // create download model
        if (req.session.imageUpload) {
            imageFile = req.files.imageFile[0];
            image._user = req.user._id;
            image.originalname = imageFile.originalname;
            image.encoding = imageFile.encoding;
            image.mimetype = imageFile.mimetype;
            image.destination = imageFile.destination;
            image.filename = imageFile.filename;
            image.path = `/uploads/${imageFile.filename}`;
            image.size = imageFile.size;
        }
        if (req.session.downloadUpload) {
            downloadFile = req.files.downloadFile[0];
            download._user = req.user._id;
            download.originalname = downloadFile.originalname;
            download.encoding = downloadFile.encoding;
            download.mimetype = downloadFile.mimetype;
            download.destination = downloadFile.destination;
            download.filename = downloadFile.filename;
            download.path = `/uploads/${downloadFile.filename}`;
            download.size = downloadFile.size;
        }
        // if update has only image upload
        if (req.session.imageUpload && !req.session.downloadUpload) {
            // update image path
            await Product.update({_id: productID}, { $set: {
                image_path: `/uploads/${imageFile.filename}`
            }}, {upsert: true});
            // check if image exists 
            await fs.stat(`${__dirname}/../public${oldProduct[0].image_path}`, (err, stats) => {
                if (err) return console.error(err);
                // deletes image
                fs.unlink(`${__dirname}/../public${oldProduct[0].image_path}`, (err) => {
                    if(err) return console.log(err);
                });  
            });
            // remove previous image data
            await Download.remove({path: oldProduct[0].image_path});
            // save new image data
            await image.save();
        }
        // if update has only download upload
        if (!req.session.imageUpload && req.session.downloadUpload) {
            // update download path
            Product.update({_id: productID}, { $set: {
                download_path: `/uploads/${downloadFile.filename}`
            }}, {upsert: true}, async (err, doc) => {
                // check if download exists 
                await fs.stat(`${__dirname}/../public${oldProduct[0].download_path}`, (err, stats) => {
                    if (err) return console.error(err);
                    // deletes download
                    fs.unlink(`${__dirname}/../public${oldProduct[0].download_path}`, (err) => {
                        if(err) return console.log(err);
                    });  
                });
                // remove previous download data
                await Download.remove({path: oldProduct[0].download_path});
                // save new download data
                await download.save();
            });
        }
        // if update has image and download upload
        if (req.session.imageUpload && req.session.downloadUpload) {
            // update new paths
            Product.update({_id: productID}, { $set: {
                image_path: `/uploads/${imageFile.filename}`,
                download_path: `/uploads/${downloadFile.filename}`
            }}, {upsert: true}, async (err, doc) => {
                // check if image exists 
                await fs.stat(`${__dirname}/../public${oldProduct[0].image_path}`, (err, stats) => {
                    if (err) return console.error(err);
                    // deletes image
                    fs.unlink(`${__dirname}/../public${oldProduct[0].image_path}`, (err) => {
                        if(err) return console.log(err);
                    });  
                });
                // check if download exists 
                await fs.stat(`${__dirname}/../public${oldProduct[0].download_path}`, (err, stats) => {
                    if (err) return console.error(err);
                    // deletes download
                    fs.unlink(`${__dirname}/../public${oldProduct[0].download_path}`, (err) => {
                        if(err) return console.log(err);
                    });  
                });
                // remove previous data and save new
                await Download.remove({path: oldProduct[0].image_path});
                await Download.remove({path: oldProduct[0].download_path});
                await image.save();
                await download.save();
            });
        }
        // redirect to product page
        req.flash('success', 'Product updated successfully.');
        return res.status(201).redirect(`/products/${productID}`);
    } catch(err) {
        console.log(err);
        res.end();
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
productController.deleteProductPerm = async (req, res) => {
    const productID = req.params.id;
    // find product data in db
    const [ product ] = await Promise.all([
        Product.findOne({_id: productID}).lean().exec()
    ]);
    // validate product title
    if (req.body.title !== product.title) {
        req.flash('error', 'Product names do not match.');
        return res.redirect(`/user/account/delete-product/${product._id}`);
    }
    try {
        // check if image exists 
        await fs.stat(`${__dirname}/../public${product.image_path}`, (err, stats) => {
            if (err) return console.error(err);
            // deletes image
            fs.unlink(`${__dirname}/../public${product.image_path}`, (err) => {
                if(err) return console.log(err);
            });  
        });
        // check if download exists 
        await fs.stat(`${__dirname}/../public${product.download_path}`, (err, stats) => {
            if (err) return console.error(err);
            // deletes download
            fs.unlink(`${__dirname}/../public${product.download_path}`, (err) => {
                if(err) return console.log(err);
            });  
        });
        // remove image and download data
        await Download.remove({path: product.image_path});
        await Download.remove({path: product.download_path});
        // remove product data in db
        await Product.remove({_id: productID});
    } catch (err) {
        console.log(err);
        return res.end();
    }
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
                    query = {_user: req.user};
                }
                if ((/^user/i).test(queryParam)) {
                    query = {_user: req.user};
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
                    .sort({order: 1})
                    .limit(req.query.limit)
                    .skip(Number.parseInt(req.query.skip) || req.skip)
                    .lean()
                    .exec(),
                Product.count(query)
            ]);
            const pageCount = Math.ceil(itemCount / req.query.limit);
            
            // set up prev url
            const docBefore = req.query.limit * (req.query.page - 2);
            const hasPerviousPagesUrl = req.query.page > 1 ?
                `/user/products?search=${searchVal}&skip=${docBefore}&page=${req.query.page - 1}` 
                : null;   
            // set up next url
            const docNow = req.query.limit * req.query.page;
            const hasNextPagesUrl = pageCount > req.query.page ? 
                `/user/products?search=${searchVal}&skip=${docNow}&page=${req.query.page + 1}` 
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