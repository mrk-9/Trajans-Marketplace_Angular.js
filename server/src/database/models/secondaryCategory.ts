import * as mongoose from 'mongoose';
'use strict';

/**
 * Module dependencies.
 */
var Schema = mongoose.Schema;

/**
 * Collection Schema
 */
var SecondaryCategorySchema = new Schema({
	name : {
		type : String
	},
	end : {
		type : Boolean,
		default : true
	},
	alias : {
		type : String
	},
	categories : {
		type : Schema.Types.Mixed
	}
});

module.exports = mongoose.model('SecondaryCategory', SecondaryCategorySchema);
