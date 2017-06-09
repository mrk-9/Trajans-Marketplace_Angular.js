import * as mongoose from 'mongoose';
'use strict';

/**
 * Module dependencies.
 */
var Schema = mongoose.Schema;

/**
 * Messaging Schema
 */
var MessageSchema = new Schema({
	from : {
		type : String,
		required : true
	},
	recipientId : {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required : true
	},
	created : {
		type: Date,
		default: Date.now
	},
	subject : {
	    type: String,
	    required: 'Please enter a subject',
	    trim: true
	},
	content : {
		type: String,
        required: 'Please enter a description',
        trim: true
	},
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
	read: {
        type: Boolean,
        default: false
    },
	replied: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Message', MessageSchema);
