import * as mongoose from 'mongoose';
'use strict';

/**
 * Module dependencies.
 */
var Schema = mongoose.Schema;

/**
 * Upload Schema
 */
var UploadSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    username: {
        type: String
    },
    userId: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    listingId: {
        type: Schema.ObjectId,
        ref: 'Listing'
    },
    path: {
        type: String
    },
    localPath: {
        type: String
    },
    croppedPath: {
        type: String
    },
    primaryImage: {
        type: Boolean,
        default: false
    },
    type: {
        type: String
    },
    originalname: {
        type: String
    },
    key: {
        type: String
    }
}, {
    versionKey: false
});

module.exports = mongoose.model('Upload', UploadSchema);
