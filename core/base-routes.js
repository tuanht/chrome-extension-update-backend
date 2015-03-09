/**
 * Abtract class (base) for all routes classes.
 *
 * It's create a new ExpressJS's (<parent route>/)
 * route and allow class that inherit can create sub-routes.
 *
 * Methods can be place in here if it's share features with many class.
 */

var express = require('express');

var OOP = require('./OOP'),
    log = require('../module/log').getInstance('base-routes.js');

module.exports = OOP.inherit(Object, {

    routes: null,

    init: function() {
        this.routes = express.Router();
        this.createRoutes();
    },

    /**
     * Class inherit from this class must override createRoutes() function
     * for create custom routes
     */
    createRoutes: function() {
        return this.router();
    },

    router: function() {
        return this.routes;
    },

    /**
     * Send a response as json with message from exeption class
     * @param req Request that send to NodeJS server
     * @param res Response object used to write request to client's browser
     * @param e Exception object catch by Javascript runtime
     *      or manually throw with classes in ./exception/
     */
    errorWithSendMessage: function(req, res, e) {
        log.info('===========================================================');

        if (e === null) {
            log.error('Exception `e` is null');
            res.send(500);
            return;
        }

        log.warn(req.method, req.url);
        log.error(e.message);
        res.statusCode = e.statusCode;
        res.json({
            result: 'error',
            name: e.name,
            message: e.message
        });
    },

    /**
     * Send a response as status code without any messages
     * @param req Request that send to NodeJS server
     * @param res Response object used to write request to client's browser
     * @param e Exception object catch by Javascript runtime
     *      or manually throw with classes in ./exception/
     */
    errorWithSendStatus: function(req, res, e) {
        log.info('===========================================================');

        if (e === null) {
            log.error('Exception `e` is null');
            res.send(500);
            return;
        }

        log.warn(req.method, req.url);
        log.error(e.message);

        // `new ObjectID()` Exception (ID not valid) will return `e` without e.statusCode
        res.send(typeof e.statusCode !== 'undefined' ? e.statusCode : 500);
    }
});
