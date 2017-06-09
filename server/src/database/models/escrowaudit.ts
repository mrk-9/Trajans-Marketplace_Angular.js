import * as mongoose from 'mongoose';
'use strict';

/**
 * Module dependencies.
 */
var Schema = mongoose.Schema;

/**
 * EscrowAudit Schema
 */
var EscrowAuditSchema = new Schema({
	event: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    },
    username : {
		type: String
	},
	userId : {
		type: String
	}
});

module.exports = mongoose.model('EscrowAudit', EscrowAuditSchema);
