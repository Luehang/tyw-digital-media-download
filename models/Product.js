const mongoose              = require('mongoose');
const Schema                = mongoose.Schema;
const mongoosePaginate      = require('mongoose-paginate');
mongoose.Promise            = require('bluebird');

const productSchema = new Schema({
    _user: {type: Schema.Types.ObjectId, ref: 'User'},
    title: {type: String, required: true},
    video_url: {type: String, default: null},
    image_path: {type: String, default: '/img/no-image.jpg'},
    download_path: {type: String},
    description: {type: String, default: 'No description available.'},
    price: {type: Number, required: true},
    sold: {type: Number, default: 0},
    download: {type: Number, default: 0},
    rating: {type: Number, default: null},
    order: {type: Number, required: true},
    category: {type: String, default: null},
    main: {type: Boolean, default: false},
    featured: {type: Boolean, default: false},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now},
    is_deleted: {type: Boolean, default: false}
});

productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Product', productSchema);
