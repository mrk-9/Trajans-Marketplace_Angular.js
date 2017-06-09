import * as mongoose from 'mongoose';
'use strict';

var Schema = mongoose.Schema;

var AreaSchema = new Schema({
    geonameId: {
        type: Number,
        required : true
    },
    name: {
        type: String,
        required : true
    }
});

var CountrySchema = new Schema({
    name: {
        type: String,
        required : true
    },
    code: {
        type: String,
        required : true
    },
    areas: {
        type: [AreaSchema],
        required: true
    }
});

module.exports = mongoose.model('Country', CountrySchema);
