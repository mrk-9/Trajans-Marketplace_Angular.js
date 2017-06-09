import * as mongoose from 'mongoose';
'use strict';

/**
 * Module dependencies.
 */
var Schema = mongoose.Schema;

/**
 * Messaging Schema
 */

var typewriterSchema = new Schema({
  text: String,
  wordsAndIcons: [
      {
         _id: false,
          words: [],
          icon: String
      }
  ]
}, {_id: false});

var SiteDefaultSchema = new Schema({
  typewriterEnabled: Boolean,
  typewriterText: [typewriterSchema],
  bannerStyle: {
    backgroundColor: {
      type: String,
      default: ''
    },
    backgroundImage: {
      type: String,
      default: ''
    },
    transition: {
      type: Boolean,
      default: false
    },
  }
});

module.exports = mongoose.model('SiteDefault', SiteDefaultSchema);
