const mongoose              = require('mongoose');
const Schema                = mongoose.Schema;
mongoose.Promise            = require('bluebird');

const orderSchema = new Schema({
    order_id: {type: String, required: true},
    download_id: {type: String, required: true},
    name: {type: String, required: true},
    email: {type: String, required: true},
    _product: {type: Schema.Types.ObjectId, ref: 'Product'},
    download: {type: Number, default: 0},
    amount: {type: Number, required: true},
    stripe_charge_id: {type: String},
    purchase_date: {type: Date, default: Date.now},
    is_deleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('Order', orderSchema);