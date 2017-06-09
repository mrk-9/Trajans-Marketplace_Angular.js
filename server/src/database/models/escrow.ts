import * as mongoose from 'mongoose';
'use strict';

/**
 * Module dependencies.
 */
var Schema = mongoose.Schema;

/**
 * Escrow Schema
 */
var EscrowSchema = new Schema({
	order : {
		type: Schema.ObjectId, 
        ref: 'Order',
	},
	type : {
		type: String,
	},
	created: {
        type: Date,
        default: Date.now
    },
	buyer : {
		type: Schema.ObjectId, 
        ref: 'User',
        required: 'Buyer is required'
	},
	seller : {
		type: Schema.ObjectId, 
        ref: 'User',
        required: 'Seller is required'
	},
	amount : {
		type : Number,
		required: 'Amount is required'
	},
	ourFeeBTC : {
		type: Number
	},
	ourFeeFiat : {
		type: Number
	},
	privateKey : {
		type : String,
		required: 'Private key is required'
	},
	publicKeys : [{
		type : String
	}],
	escrowAddress : {
		type : String,
		required: 'Address is required'
	},
	redeemScript : {
		type : String
	},
	fee : {
		type : Number,
		default : 5430
	},
	change : {
		type : String
	},
	recipientAddress : {
		type : String
	},
	balance : {
		type : Number,
		default : 0
	},
	unconfirmedBalance : {
		type : Number,
		default : 0
	},
	status : {
		type : String,
		default : 'UNPAID'
	},
	serialised : {
		type : String
	},
	fullySigned : {
		type : Boolean,
		default : false
	},
	signed : {
		type : String
	},
	txid : {
		type : String
	},
	refundRequested : {
		type : Boolean,
		default : false
	},
	refundAddress : {
		type : String
	},
	refundReason : {
		type : String
	},
	buyerRecieved : {
		type : Boolean,
		default: false
	},
	sellerRecieved : {
		type : Boolean,
		default: false
	},
	escrowAudits: [{
        type: Schema.ObjectId,
        ref: 'EscrowAudit'
    }],
    directEscrow : {
        type : Boolean
    }
});

module.exports = mongoose.model('Escrow', EscrowSchema);
