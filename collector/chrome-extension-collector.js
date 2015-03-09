/**
 * Query all version informations for an extension and return result to route
 */

var OOP = require('../core/OOP'),
    BaseMongooser = require('../core/base-mongooser'),
    ChromeExtension = require('../schema/chrome-extension-schema'),
    ChromeExtensionVersion = require('../schema/chrome-extension-version-schema'),
    Exception = require('../exception/exception');

module.exports = OOP.inherit(BaseMongooser, {

    appId: '',

    /**
     * Set app_id and begin query to get app version history
     * @param app_id App (extension) id, like `rpgn94k3n5520fdp9fvms0qkwms'
     */
    init: function(app_id, success_callback, failure_callback) {
        this.parent(success_callback, failure_callback);

        if (typeof app_id !== 'string' || app_id === '') {
            return this.error(Exception.BadRequest, 'app_id are not string');
        }

        this.appId = app_id;

        this.getExtension();
    },

    /**
     * Query in Version table for all versions by extension object ID
     * @param extension_object_id Mongo DB object ID
     */
    getVersions: function(extension_object_id) {
        var cb = function(err, docs) {
            if (err) {
                return this.error(Exception.Unknown, err);
            }

            if (docs.length === 0) {
                return this.error(Exception.NotFound, 'Could not found any version for app_id: ' + this.appId);
            }

            this.cbSuccess(this.extension, docs);
        };

        ChromeExtensionVersion.find({
            'extension_object_id': extension_object_id
        }, cb.bind(this));
    },

    /**
     * Query in Extension table by appId (setted in init() )
     */
    getExtension: function() {
        var cb = function(err, doc) {
            if (err) {
                return this.error(Exception.Unknown, err);
            }

            if (doc === null) {
                return this.error(Exception.NotFound, 'Could not found app_id: ' + this.appId);
            }

            this.extension = doc;

            this.getVersions(doc._id);
        };

        ChromeExtension.findOne({
            'app_id': this.appId
        }, cb.bind(this));
    }
});
