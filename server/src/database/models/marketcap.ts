import * as mongoose from 'mongoose';
'use strict';

/**
 * Module dependencies.
 */
var Schema = mongoose.Schema;

/**
 * EscrowAudit Schema
 */
var MarketCapSchema = new Schema({
    btc: {
        type: String
    },
    alt: {
        type: String
    },
    total: {
        type: String
    }
});

module.exports = mongoose.model('MarketCap', MarketCapSchema);
