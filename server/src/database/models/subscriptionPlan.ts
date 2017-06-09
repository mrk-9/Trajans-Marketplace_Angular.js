import * as mongoose from 'mongoose';
'use strict';

/**
 * Module dependencies.
 */
var Schema = mongoose.Schema;

/**
 * Collection Schema
 */
var SubscriptionPlanSchema = new Schema({
	planId: {
		type: String
	},
	group: {
		type: String
	},
	planNo: {
		type: Number
	},
	name: {
		type: String
	},
	displayName: {
		type: String
	},
	tagline: {
		type: String
	},
	description: {
		type: String
	},
	percentage: {
		type: Number
	},
	features: {
		type: [String]
	}
});

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
