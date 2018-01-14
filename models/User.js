const mongoose              = require('mongoose');
const { Schema }            = mongoose;
mongoose.Promise            = require('bluebird');
const bcrypt                = require('bcrypt-nodejs');

const userSchema = new Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
    business_type: {type: String, default: 'individual', enum: ['individual', 'company']},
    company_name: {type: String, default: null},
    created_at: {type: Date, default: Date.now},
    is_deleted: {type: Boolean, default: false}
});

userSchema.methods.encryptPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
}

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', userSchema);