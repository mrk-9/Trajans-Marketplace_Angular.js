import * as mongoose from 'mongoose';
import * as moment from 'moment';

import constants from '../../constants/constants';

let Schema = mongoose.Schema;

let FeaturedSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    expires: {
        type: Date
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    paymentAddress: {
        type: String
    },
    balance: {
        type: Number,
        default: 0
    },
    amount: {
        type: Number
    },
    status: {
        type: String,
        default: constants.featuredStatuses.pending
    }
});


FeaturedSchema.pre('save', function(next) {
    if (this.created) {
        this.expires = moment(this.created).add(10, 'minutes');
    }
    next();
});


module.exports = mongoose.model('Featured', FeaturedSchema);
