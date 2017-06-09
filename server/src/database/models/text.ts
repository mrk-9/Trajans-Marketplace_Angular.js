import * as mongoose from 'mongoose';
'use strict';

/**
 * Text dependencies.
 */
var Schema = mongoose.Schema;

/**
 * Text Schema
 */
var TextSchema = new Schema({
    from: {
        type: Schema.ObjectId,
        ref: 'User',
        required : true
    },
    to: {
        type: Schema.ObjectId,
        ref: 'User',
        required : true
    },
    message: {
        type: String,
        required : true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Text', TextSchema);
