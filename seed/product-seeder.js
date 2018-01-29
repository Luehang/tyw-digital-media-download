// ==========================================================================
// DANGER. IF ACTIVATED, WILL REMOVE ALL OF THIS MODELS DATA.
// ==========================================================================

const User = require('../models/User');
const Product = require('../models/Product');

// connect to mongo db
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/download-shop', { useMongoClient: true });

// data to add to mongo db
User.findOne({email: 'user@test.com'}, async (err, user) => {
    if (err) console.error(err);
    const products = [
        new Product({
            _user: user._id,
            title: 'The Italian Dolomites',
            image_path: "https://c1.staticflickr.com/1/632/21136101110_1dde1c1a7e_o.jpg",
            download_path: "https://c1.staticflickr.com/1/632/21136101110_1dde1c1a7e_o.jpg",
            description: 'Interview with Andy Free about his trip to the dolomites in Italy',
            price: 15.70,
            rating: 5,
            order: 2
        }),
        new Product({
            _user: user._id,
            title: 'Visiting Vester Peak',
            image_path: "https://farm1.staticflickr.com/571/21101592188_f5da31c3f5_o.jpg",
            download_path: "https://farm1.staticflickr.com/571/21101592188_f5da31c3f5_o.jpg",
            description: 'Everything you should know about hiking in the mountains',
            price: 23.78,
            rating: 4,
            order: 3
        }),
        new Product({
            _user: user._id,
            title: 'Trailing Together',
            image_path: "https://i.redd.it/ool7yp323aux.jpg",
            download_path: "https://i.redd.it/ool7yp323aux.jpg",
            description: 'Walking among the nature in the Rocky Mountain National Park, Colorado',
            price: 11.47,
            rating: 3.4,
            order: 4
        }),
        new Product({
            _user: user._id,
            title: 'The Magic Pond',
            image_path: "https://i.redd.it/cz572ctve9ux.jpg",
            download_path: "https://i.redd.it/cz572ctve9ux.jpg",
            description: 'The scenery is set like a Monet painting',
            price: 11.47,
            rating: 3.6,
            order: 1
        }),
        new Product({
            _user: user._id,
            title: 'Beach Essentials',
            image_path: "https://i.redd.it/etwqy45ntqcx.jpg",
            download_path: "https://i.redd.it/etwqy45ntqcx.jpg",
            description: 'What should you bring to the beach, and what beaches should you visit?',
            price: 23.78,
            rating: 4.6,
            order: 5
        }),
        new Product({
            _user: user._id,
            title: 'Romantic Camping',
            image_path: "https://farm6.staticflickr.com/5692/21342201074_aef835df8d_k.jpg",
            download_path: "https://farm6.staticflickr.com/5692/21342201074_aef835df8d_k.jpg",
            description: 'We went to Norway to find out just how romantic it can be sleeping under the stars',
            price: 11.47,
            rating: 3.7,
            order: 6
        }),
        new Product({
            _user: user._id,
            title: 'Cave Explorers',
            image_path: "https://i.redd.it/co3a6ufwmuqx.jpg",
            download_path: "https://i.redd.it/co3a6ufwmuqx.jpg",
            description: 'In USA there\'s over a thousand caves. We list everyone that you should visit.',
            price: 11.47,
            rating: 2.7,
            order: 7
        })
    ];
    // clear data collection
    mongoose.connection.dropCollection('products', async (err, result) => {
        // iterate over data and add to db
        await products.forEach((product) => {
            product.save();
        });
        await exit();
    });
});

// db disconnection function
function exit() {
    mongoose.disconnect();
}