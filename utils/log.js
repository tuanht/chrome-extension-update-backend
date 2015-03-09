var util = require('util'),
    dateFormat = require('dateformat'),
    clc = require('cli-color');

/**
 * Create new Log instance that will print to the console with following template:
 * [date] [context] MSG
 *
 * @param context May be module name or anything that indicate where's it logged
 * @constructor
 */
function Log(context) {
    this._context = context;
}

Log.prototype = {
    _context: '',

    /**
     * Format and return a message string (formatted) with addition format
     *
     * @param (format [, ..., ...])
     *        Message will log with format follow by NodeJS's util.format() syntax
     * @returns {String}
     *          Message string
     */
    _logString: function() {
        var __msg = arguments[0];
        var __args = Array.prototype.slice.call(arguments);
        __args.splice(0, 1); // remove first element

        __args.unshift(this._context);
        __args.unshift(dateFormat(new Date(), 'yyyy-mm-dd hh:MM:ss'));
        __args.unshift('[%s] [%s] ' + __msg);

        return util.format.apply(util, __args);
    },

    /**
     * Print log information
     *
     * @param (format [, ..., ...])
     *        Message will log with format follow by NodeJS's util.format() syntax
     */
    info: function() {
        console.log(this._logString.apply(this, arguments));
    },

    /**
     * Print log & stack trace for error message. Error message color are red
     *
     * @param (format [, ..., ...])
     *        Message will log with format follow by NodeJS's util.format() syntax
     */
    error: function() {
        console.log(clc.red(this._logString.apply(this, arguments)));
        console.trace();
    },

    /**
     * Print log for warning message. Text color are yellow
     *
     * @param (format [, ..., ...])
     *        Message will log with format follow by NodeJS's util.format() syntax
     */
    warn: function() {
        console.log(clc.yellow(this._logString.apply(this, arguments)));
    }
};

/**
 * Get single instance of Log class
 *
 * @param context May be module name or anything that indicate where's it logged
 * @returns {Log} Instance of Log
 */
exports.getInstance = function(context) {
    return new Log(context);
};
