import * as mongoose from 'mongoose';
'use strict';

/**
 * Module dependencies.
 */
var Schema = mongoose.Schema;

/**
 * Collection Schema
 */
var ListingImageSchema = new Schema({
	username: {
		type: String
	},
	userId: {
		type: String
	},
	listing : {
		type: Schema.ObjectId,
        ref: 'Listing'
	},
	path: {
		type: String
	},
	croppedPath: {
		type: String
	},
	primaryImage : {
		type : Boolean,
		default : false
	},
	uuid : {
		type : String
	},
	createdAt: Date
});

module.exports = mongoose.model('ListingImage', ListingImageSchema);
