import * as mongoose from 'mongoose';
'use strict';

/**
 * Module dependencies.
 */
var Schema = mongoose.Schema;

/**
 * Collection Schema
 */
var TertiaryCategorySchema = new Schema({
	name: {
		type: String
	},
	categories: {
		type: Schema.Types.Mixed
	}
});

module.exports = mongoose.model('TertiaryCategory', TertiaryCategorySchema);
