/**
 * Abtract class for manage callback and error handle when work with MongoDB
 */

var debug = require('debug')('base-mongooser.js');

var OOP = require('./OOP'),
    Exception = require('../exception/exception');

var BaseMongooser = OOP.inherit(Object, {

    cbSuccess: null,
    cbFailure: null,
    exception: null,

    /**
     * Set callback for DBs operations
     * @param success_callback Function call when query success
     * @param failure_callback Function call when query failure
     */
    init: function (success_callback, failure_callback) {

        if (success_callback === null || typeof success_callback !== 'function') {
            throw new Exception.Internal('success_callback must be a function');
        }

        if (failure_callback === null || typeof failure_callback !== 'function') {
            throw new Exception.Internal('failure_callback must be a function');
        }

        this.cbSuccess = (success_callback === 'function () { [native code] }') ? success_callback : success_callback.bind(this);
        this.cbFailure = (failure_callback === 'function () { [native code] }') ? failure_callback : failure_callback.bind(this);
    },

    /**
     * Check for query result is Exception or not
     */
    resultIsException: function(result) {
        return (typeof result.result    !== 'undefined' &&
                typeof result.name      !== 'undefined' &&
                typeof result.message   !== 'undefined');
    },

    /**
     * Create a new Exeption instance from a message
     * @param Class Class we want to create
     * @param msg Message, can be a object or string
     * @return an instance with property is message object
     */
    getExceptionInstance: function(Class, msg) {
        var result = null;

        if (typeof msg === 'string') {
            result = new Class(msg);
        } else if (msg.name === 'ValidationError') {
            // Override exception class
            result = new Exception.BadRequest(msg.toString());
        } else {
            result = new Class(msg.err);
        }

        return result;
    },

    /**
     * Handle exception that will return as success with message to client.
     *
     * @param $class
     * @param msg {string|mongoose_error}
     */
    errorButNotFail: function($class, msg) {
        this.exception = this.getExceptionInstance($class, msg);

        return this.cbSuccess({
            result: 'exception',
            name: this.exception.name,
            message: this.exception.message,
            _class: $class
        });
    },

    /**
     * Handle exception that will return as error with message to client.
     *
     * @param $class
     * @param msg {string|mongoose_error}
     */
    error: function($class, msg) {
        if (msg.code === 11000) {
            // Duplicate with unique field, not error
            debug(msg.message);
            debug('Warning: Duplicate, error ignore');
            return this.cbSuccess();
        }

        this.exception = this.getExceptionInstance($class, msg);
        this.cbFailure(this.exception);
    }
});

module.exports = BaseMongooser;
