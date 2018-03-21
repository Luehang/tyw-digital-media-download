const mongoose              = require('mongoose');
const Schema                = mongoose.Schema;
mongoose.Promise            = require('bluebird');

const reviewSchema = new Schema({
    _product: {type: Schema.Types.ObjectId, ref: 'Product'},
    userId: {type: String, required: false},
    name: {type: String, required: true},
    rating: {type: Number, required: true},
    percent_rating: {type: Number, required: true},
    message: {type: String, required: true},
    created_at: {type: Date, default: Date.now},
    is_deleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('Review', reviewSchema);