import * as mongoose from 'mongoose';
'use strict';

/**
 * Module dependencies.
 */
var Schema = mongoose.Schema;

/**
 * Message Schema
 */
var ConversationSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    from: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    to: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    subject: {
        type: String
    },
    messages: [{
        type: Schema.ObjectId,
        ref: 'Text'
    }],
    type : {
        type : String
    },
	attachments: [{
        type: Schema.ObjectId,
        ref: 'Upload'
    }]
});

module.exports = mongoose.model('Conversation', ConversationSchema);
