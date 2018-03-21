// ==========================================================================
// TEST: DANGER. WILL REMOVE ALL OF THIS MODELS DATA.
// ==========================================================================

const Review = require('../models/Review');
const User = require('../models/User');
const Product = require('../models/Product');

// connect to mongo db
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/download-shop', { useMongoClient: true });

// add data to mongo db then exit
createModels();

async function createModels() {
    try {
        const [ item ] = await Promise.all([
            Product.find({title: 'The Magic Pond'}).lean().exec()
        ]);

        const reviews = [
            new Review({
                _product: item[0]._id,
                name: 'Ashley',
                rating: 3,
                percent_rating: 60,
                message: "This is some message.",
                created_at: new Date('15 December 2017 14:48 UTC').toISOString()
            }),
            new Review({
                _product: item[0]._id,
                name: 'Dave',
                rating: 4,
                percent_rating: 80,
                message: "This is another message.",
                created_at: new Date('16 December 2017 14:48 UTC').toISOString()
            }),
            new Review({
                _product: item[0]._id,
                name: 'Sophie',
                rating: 5,
                percent_rating: 100,
                message: "Another generated message.",
                created_at: new Date('17 December 2017 14:48 UTC').toISOString()
            }),
            new Review({
                _product: item[0]._id,
                name: 'Mark',
                rating: 2,
                percent_rating: 40,
                message: "200Lorem ipsum dolor sit amet, pro cu amt ponderum, inani doctus apeirian at eum, his quaeque fierent at. Debet prodesset no has, vel reque everti inermis ut. Ferri aliquam mei ex. Ea fabulas impedit.",
                created_at: new Date('18 December 2017 14:48 UTC').toISOString()
            }),
            new Review({
                _product: item[0]._id,
                name: 'Some dude',
                rating: 5,
                percent_rating: 100,
                message: "300Lorem ipsum dolor ameet, id vim cetero hendrerit consectetuer, nobis persius quo in, eum nusquam phaedrum id. Pri tale alterum fierent te, ex omnium discere invenire qui. Mei graece tacimates pertinacia in, has in tota nostrud interpretaris, in habemus fabellas usu. His unum clita sensibus fad a.",
                created_at: new Date('19 December 2017 14:48 UTC').toISOString()
            }),
            new Review({
                _product: item[0]._id,
                name: 'Some dude 2',
                rating: 4,
                percent_rating: 80,
                message: "test",
                created_at: new Date('20 December 2017 14:48 UTC').toISOString()
            })
        ];
        // clear data collection and save new
        Review.remove({}, async (err) => {
            if (err) console.log(err);
            await reviews.forEach((review) => {
                review.save();
            });
            await exit();
        })
    } catch (err) {
        console.log(err);
    }
}

// db disconnection function
function exit() {
    mongoose.disconnect();
}