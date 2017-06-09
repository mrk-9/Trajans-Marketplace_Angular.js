import * as mongoose from 'mongoose';
'use strict';

/**
 * Module dependencies.
 */
var Schema = mongoose.Schema;

/**
 * Inbox Schema
 */
var InboxSchema = new Schema({
	from : {
		type : String
	},
	date : {
		type: Date,
		default: Date.now
	},
	subject : {
	    type: String
	},
	read: {
        type: Boolean,
        default: false
    },
	deleted: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Inbox', InboxSchema);
