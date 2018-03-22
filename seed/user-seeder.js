// ==========================================================================
// TEST: DANGER. WILL REMOVE ALL OF THIS MODELS DATA.
// ==========================================================================

const User = require('../models/User');

// connect to mongo db
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/download-shop', { useMongoClient: true });

// data to add to mongo db
const users = [
    new User({
        email: 'lue_hang@hotmail.com'
    })
];
users[0].password = User.encryptPassword('password');

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