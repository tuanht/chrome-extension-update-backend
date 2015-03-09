#!/bin/env node

var util = require('util'),
    express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser');

var OOP = require('./core/OOP'),
    log = require('./module/log').getInstance('server.js'),
    Config = require('./config');

var ChromeRoutes = require('./routes/chrome-routes')

var ClientLoggingSaver = require('./saver/client-logging-saver');

var IMBackend = OOP.inherit(Object, {

    /**
     *  Initializes the IM Backend.
     */
    init: function() {
        this.setupVariables();
        this.setupTerminationHandlers();

        // Create the express server and routes.
        this.initializeServer();

        log.info('Running as %s environment', Config.IM_ENVIRONMENT);
    },

    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server port # using env variables/defaults.
     */
    setupVariables: function() {
        this.PORT = process.env.PORT || 80;
        this.MONGO_USERNAME = process.env.MONGO_USERNAME || Config.getMongoConfig('USERNAME');
        this.MONGO_PASSWORD = process.env.MONGO_PASSWORD || Config.getMongoConfig('PASSWORD');
        this.MONGO_HOSTNAME = process.env.MONGO_HOSTNAME || Config.getMongoConfig('HOSTNAME');
        this.MONGO_DBNAME = process.env.MONGO_DBNAME     || Config.getMongoConfig('DBNAME');
        this.MONGO_PORT = process.env.MONGO_PORT         || Config.getMongoConfig('PORT');
    },

    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    terminator: function(sig){
        if (typeof sig === 'string') {
            log.info('Received %s - terminating app ...', sig);
            process.exit(1);
        }
        log.info('Node server stopped.');
    },

    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    setupTerminationHandlers: function(){
        var self = this;

        //  Process on exit and signals.
        process.on('exit', function() {
            self.terminator();
        });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element/*, index, array*/) {
                process.on(element, function() { self.terminator(element); });
            });
    },

    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    mongooseConnection: function() {
        mongoose.connection.on('open', function () {
            log.info('Connected to MongoDB: %s', this.MONGO_HOSTNAME);
        }.bind(this));

        mongoose.connection.on('error', function (err) {
            log.error('Fail when connect to MongoDB: %s', err);
        });

        try {
            mongoose.connect(util.format('mongodb://%s:%s@%s:%s/%s',
                this.MONGO_USERNAME, this.MONGO_PASSWORD,
                this.MONGO_HOSTNAME, this.MONGO_PORT,
                this.MONGO_DBNAME));
        } catch(e) {
            log.error(e);
        }
    },

    /**
     * Route middleware that will happen on every request.
     */
    routeMiddleware: function(req, res, next) {
        var imClientId = req.headers['im-client-id'];

        if (typeof imClientId === 'undefined' || imClientId === '') {
            if (Config.IM_ENVIRONMENT !== Config.DEV_ENVIRONMENT) {
                return res.send(403); // Forbidden access
            } else {
                imClientId = 'unknown';
            }
        }

        // Log request by client to DB
        new ClientLoggingSaver(imClientId, function() {}, function() {});

        if (Config.IM_ENVIRONMENT === Config.DEV_ENVIRONMENT) {
            console.log('');
        }

        // continue doing what we were doing and go to the route
        next();
    },

    /**
     *  Create the routing table entries + handlers for the application.
     */
    createRoutes: function() {
        // Route middleware that will happen on every request.
        this.app.use(this.routeMiddleware.bind(this));

        this.app.get('/', function(req, res) {
            res.send('Welcome!');
        });

        this.app.use('/chrome', new ChromeRoutes().router());
    },

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    initializeServer: function() {
        this.app = express();

        // configure app to use bodyParser()
        // this will let us get the data from a POST
        this.app.use(bodyParser());

        if (Config.IM_ENVIRONMENT === Config.DEV_ENVIRONMENT) {
            var morgan = require('morgan');
            this.app.use(morgan('dev')); // log every request to the console
        }

        this.mongooseConnection();
        this.createRoutes();
    },

    /**
     *  Start the server.
     */
    start: function() {
        var self = this;

        //  Start the app on the specific port.
        this.app.listen(this.PORT, function() {
            log.info('Listening on port %d', self.PORT);
        });
    }
});

/**
 *  main():  Main code.
 */
var zapp = new IMBackend();
zapp.start();
