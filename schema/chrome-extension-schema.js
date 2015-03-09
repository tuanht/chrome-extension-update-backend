var mongoose = require('mongoose');

var Schema = mongoose.Schema;
// ObjectId = Schema.Types.ObjectId;

module.exports = mongoose.model('chrome_extension', new Schema({
    name: String,
    app_id: {
        type: String,
        unique: true
    }, /* cfhdojbkjhnklbpkdaibdccddilifddb */
    status: {
        type: String,
        default: 'published' // TODO remove later
    }, /* pending, published, expired */
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}));
