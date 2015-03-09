/**
 * Routes for generate Update XML for Chrome extension
 * Chrome will request route define in this class to check for newest version of extension
 */

var builder = require('xmlbuilder');

var OOP = require('../core/OOP'),
    BaseRoutes = require('../core/base-routes'),
    utils = require('../module/utils'),
    ChromeExtensionCollector = require('../collector/chrome-extension-collector');

module.exports = OOP.inherit(BaseRoutes, {

    init: function() {
        this.parent();
    },

    /**
     * Automatically call after init
     */
    createRoutes: function() {
        this.routes.get('/update', this.update.bind(this));
    },

    createXML: function(extension, versions) {
        // Create XML tag
        var xml = builder.create('gupdate', {
            'version': '1.0',
            'encoding': 'UTF-8'
        }).att({
            'xmlns': 'http://www.google.com/update2/response',
            'protocol': '2.0'
        });

        var app = xml.ele('app', {
            'appid': extension.app_id
        });

        // Append <updatecheck> to <app>
        for (var i = 0; i < versions.length; i++) {
            var v = versions[i];
            app.ele('updatecheck', {
                'codebase': v.codebase,
                'version': v.version
            });
        }

        return xml.end({
            pretty: true
        });
    },

    /**
     * Return an update manifest XML document listing
     * the latest version of an extension.
     */
    update: function(req, res) {
        var self = this;

        var x = utils.parseGetParams(req.query.x);
        var appId = x.id;
        // var version = x['v'];

        var cb = function(xml_str) {
            res.set('Content-Type', 'text/xml');
            res.send(xml_str);
        };

        try {
            new ChromeExtensionCollector(appId, function success(extension, versions) {

                cb(self.createXML(extension, versions));
            }, function failure() {
                self.errorWithSendMessage(req, res, this.exception);
            });
        } catch (e) {
            self.errorWithSendStatus(req, res, e);
        }
    }
});
