// ==========================================================================
// TEST: DANGER. WILL REMOVE ALL OF THIS MODELS DATA.
// ==========================================================================

const User = require('../models/User');
const bcrypt = require('bcrypt-nodejs');

// connect to mongo db
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/download-shop', { useMongoClient: true });

// encrypt password
function encryptPass(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
}

// data to add to mongo db
const users = [
    new User({
        email: 'user@test.com',
        password: encryptPass('password')
    })
];

// clear data collection
mongoose.connection.dropCollection('users', (err, result) => {
    // iterate over data and add to db
    var done = 0;
    for (var i = 0; i < users.length; i++) {
        users[i].save(function(err, result) {
            done++;
            if (done === users.length) {
                exit();
            }
        });
    }
});

// db disconnection function
function exit() {
    mongoose.disconnect();
}