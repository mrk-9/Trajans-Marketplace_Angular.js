import * as mongoose from 'mongoose';
'use strict';

/**
 * Module dependencies.
 */
var Schema = mongoose.Schema;

/**
 * Order Schema
 */
var OrderSchema = new Schema({
    order_items: {
        type: Array,
        required: true
    },
    order_items_coinjar: {
        type: Array
    },
    sellerId: {
        type: String,
        required: true
    },
    seller: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    listingId: {
        type: String,
        required: true
    },
    listing: {
        type: Schema.ObjectId,
        ref: 'Listing',
    },
    totalOverallCostAUD: {
        type: Number,
        default: 0
    },
    totalOverallCostBTC: {
        type: Number,
        default: 0
    },
    reviewCompleted: {
        type: Boolean,
        default: false
    },
    totalShippingCost: {
        type: Number,
        default: 0
    },
    totalShippingCostBTC: {
        type: Number,
        default: 0
    },
    totalEscrowCost: {
        type: Number,
        default: 0
    },
    totalEscrowCostBTC: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        required: true,
        default: 'UNPAID'
    },
    created: {
        type: Date,
        default: Date.now
    },
    created_at: {
        type: String
    },
    updated_at: {
        type: String
    },
    expires_at: {
        type: String
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    escrow: {
        default: false,
        type: Boolean
    },
    escrowSimple: {
        default: false,
        type: Boolean
    },
    uuid: {
        type: String
    },
    refunds: {
        type: Boolean
    },
    available_for_refund: {
        type: Number
    },
    multisigEscrow: {
        type: Schema.ObjectId,
        ref: 'Escrow'
    },
    bitcoin_address: {
        type: String
    },
    bitcoin_amount: {
        type: String
    },
    currency: {
        type: String
    },
    merchant_reference: {
        type: String
    },
    merchant_invoice: {
        type: String
    },
    return_url: {
        type: String
    },
    cancel_url: {
        type: String
    },
    notify_url: {
        type: String
    },
    fee: {
        type: String
    },
    payment_page_url: {
        type: String
    },
    orderProceeded: {
        type: Boolean,
        default: false
    },
    orderShipped: {
        type: Boolean,
        default: false
    },
    shippingStatus: {
        type: String,
        default: 'Not shipped'
    },
    coinJar: {
        type: String,
        default: 'no'
    },
    coinJarUsed: {
        type: Boolean,
        default: false
    },
    streetAddress: {
        type: String
    },
    town: {
        type: String
    },
    country: {
        type: String
    },
    city: {
        type: String
    },
    postcode: {
        type: String
    },
    telephoneNumber: {
        type: String
    },
    buyerEmail: {
        type: String
    },
    sellerEmail: {
        type: String
    },
    conversation: {
        type: Schema.ObjectId,
        ref: 'Conversation'
    },
    bitposOrderId: {
        type: Number
    },
    bitposEncodedOrderId: {
        type: String
    },
    bitposMerchantName: {
        type: String
    },
    bitposDescription: {
        type: String
    },
    bitposSatoshiAmount: {
        type: Number
    },
    bitposTransactionSpeed: {
        type: String
    },
    bitposBitcoinUri: {
        type: String
    },
    bitposReference: {
        type: String
    },
    bitposLoadDate: {
        type: Number
    },
    bitposUsed: {
        type: Boolean
    },
    bitposBalance: {
        type: Number,
    },
    changeAddress: {
        type: String
    },
    userEmail: {
        type: String
    },
    directBalance: {
        type: Number
    }
});

module.exports = mongoose.model('Order', OrderSchema);
