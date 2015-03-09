/**
 * Insert a new record to count request of each client (extension user) per day
 *
 * Usage: new ClientLoggingSaver(<cliend_id>) to write to DB
 */

var OOP = require('../core/OOP'),
    BaseMongooser = require('../core/base-mongooser'),
    ClientLoggingSchema = require('../schema/client-logging-schema'),
    Exception = require('../exception/exception');

// var ObjectId = mongoose.Types.ObjectId;

var ClientLoggingSaver = OOP.inherit(BaseMongooser, {

    clientId: '',

    /**
     * Begin insert or update log DB
     * @param client_id ID that generate random for each user install extension
     *      on their machine
     */
    init: function(client_id, success_callback, failure_callback) {
        this.parent(success_callback, failure_callback);

        if (typeof client_id !== 'string' || client_id === '') {
            return this.error(Exception.BadRequest, 'Client ID are not string');
        }

        this.clientId = client_id;
        this.currentDate = new Date();

        this.save();
    },

    save: function() {
        // Query the exists log of client by current date
        var start = new Date(this.currentDate.getFullYear(),
                this.currentDate.getMonth(),
                this.currentDate.getDate(), 0, 0, 0),
            end = new Date(this.currentDate.getFullYear(),
                this.currentDate.getMonth(),
                this.currentDate.getDate(), 23, 59, 59);

        ClientLoggingSchema.findOne({
            'client_id': this.clientId,
            'log_start_date': {
                '$gte': start,
                '$lt': end
            }
        }, function cb(err, doc) {

            if (err) {
                return this.error(Exception.Unknown, err);
            }

            if (doc) {
                // Update count
                doc.count += 1;
                doc.log_end_date = this.currentDate;
            } else {
                // Create new
                doc = new ClientLoggingSchema();
                doc.client_id = this.clientId;
            }

            doc.save();
            this.cbSuccess();

        }.bind(this));
    }
});

module.exports = ClientLoggingSaver;
