import * as mongoose from 'mongoose';
'use strict';

/**
 * Module dependencies.
 */
var Schema = mongoose.Schema;

/**
 * User Profile Schema
 */
var UserProfileSchema = new Schema({
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    merchantName: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    streetAddress: {
        type: String,
        default: ''
    },
    town: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    postcode: {
        type: String,
        default: ''
    },
    checkoutStreetAddress: {
        type: String,
        default: ''
    },
    checkoutTown: {
        type: String,
        default: ''
    },
    checkoutCountry: {
        type: String,
        default: ''
    },
    checkoutPostcode: {
        type: String,
        default: ''
    },
    checkoutTelephoneNumber: {
        type: String,
        default: ''
    },
    telephoneNumber: {
        type: String,
        default: ''
    },
    profileBlurb: {
        type: String,
        default: ''
    },
    walletAddress: {
        type: String,
        default: ''
    },
    hasWalletAddress: {
        type:Boolean,
        default:false
    },
    paymentMethodCreated: {
        type: Boolean,
        default: false
    },
    /* For updating profile */
    updateProfileToken: {
        type: String,
        required: true
    },
    updateProfileExpires: {
        type: String,
        required: true
    },
    pgpKey: {
        type: String,
        trim: true
    },
    bitposPassword: {
        type: String
    },
    bitposUsername: {
        type: String
    },
    bitposEnabled: {
        type: Boolean,
        default: false
    },
    merchantProfileAdded: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);
