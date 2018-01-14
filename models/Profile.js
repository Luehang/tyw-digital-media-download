const mongoose              = require('mongoose');
const { Schema }            = mongoose;
mongoose.Promise            = require('bluebird');

const profileSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    image_path: {type: String, default: '/img/default-avatar.svg'},
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    business_number: {type: String},
    phone_number: {type: String, required: true},
    business_type: {type: String, required: true},
    company_name: {type: String, default: null},
    billing_address: {
        address: {type: String},
        city: {type: String},
        state: {type: String},
        zip: {type: String},
        country: {type: String}
    },
    home_address: {
        same_as_billing: {type: String},
        address: {type: String, required: true},
        city: {type: String, required: true},
        state: {type: String, required: true},
        zip: {type: String, required: true},
        country: {type: String, required: true}
    },
    created_at: {type: Date, default: Date.now},
    last_updated: {type: Date, default: Date.now},
    is_deleted: {type: String, default: false}
});

// const autoPopulateUser = function(next) {
//     this.populate({
//         path: 'user',
//         select: 'email'
//     });
//     next();
// }

// profileSchema.pre('find', autoPopulateUser);

module.exports = mongoose.model('Profile', profileSchema);