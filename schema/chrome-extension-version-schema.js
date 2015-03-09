var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

module.exports = mongoose.model('chrome_extension_version', new Schema({
    extension_object_id: ObjectId,
    codebase: String,
    version: String
}));
