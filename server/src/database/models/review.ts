import * as mongoose from 'mongoose';
'use strict';

/**
 * Module dependencies.
 */
var Schema = mongoose.Schema;

/**
 * Category Schema
 */
var ReviewSchema = new Schema({
	title: {
		type: String
	},
	description: {
		type: String
	},
	rating: {
		type: Number
	},
	created: {
		type: Date,
		default: Date.now
	},
	orderId: {
		type: String
	},
	createdBy: {
		type: Schema.Types.ObjectId,
    	ref: 'User'
	},
	user: {
	    type: Schema.Types.ObjectId,
	    ref: 'User'
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
