const mongoose              = require('mongoose');
const Schema                = mongoose.Schema;
const mongoosePaginate      = require('mongoose-paginate');
mongoose.Promise            = require('bluebird');

const productSchema = new Schema({
    title: {type: String, required: true},
    image_path: {type: String, default: "/img/no-image.jpg"},
    description: {type: String, default: 'No description available.'},
    price: {type: Number, required: true},
    sold: {type: Number, default: 0},
    download: {type: Number, default: 0},
    rating: {type: Number, default: null},
    category: {type: String, default: null},
    main: {type: Boolean, default: false},
    featured: {type: Boolean, default: false},
    created_at: {type: Date, default: Date.now},
    is_deleted: {type: Boolean, default: false}
});

productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Product', productSchema);
