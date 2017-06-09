import * as mongoose from 'mongoose';
'use strict';

/**
 * Module dependencies.
 */
var Schema = mongoose.Schema;

/**
 * Category Schema
 */
var PurchaseSchema = new Schema({
	listingId : {
		type: String,
		required : true
	},
	buyerLocation : {
		type : String,
		required : true
	}
});

module.exports = mongoose.model('Purchase', PurchaseSchema);
