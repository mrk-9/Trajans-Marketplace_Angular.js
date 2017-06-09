import * as mongoose from 'mongoose';

var Schema = mongoose.Schema;
var crypto = require('crypto');
var _ = require('lodash');

var validateLocalStrategyProperty = function(property) {
    return ((this.provider !== 'local' && !this.updated) || property.length);
};

var validateLocalStrategyPassword = function(password) {
    return (this.provider !== 'local' || (password && password.length > 6));
};

var trialDateExpire = function() {
    var date = new Date();
    var trialEndDate = date.setDate(date.getDate() + 14);
    return trialEndDate;
};

var UserSchema = new Schema({
    firstName: {
        type: String,
        trim: true,
        default: '',
        validate: [validateLocalStrategyProperty, 'Please fill in your first name']
    },
    lastName: {
        type: String,
        trim: true,
        default: '',
        validate: [validateLocalStrategyProperty, 'Please fill in your last name']
    },
    agreement: {
        type: Boolean,
        required: 'You must agree to the terms and conditions'
    },
    displayName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        default: '',
        unique: 'Email address already taken...',
        validate: [validateLocalStrategyProperty, 'Please fill in your email address'],
        match: [/.+\@.+\..+/, 'Please fill in a valid email address']
    },
    username: {
        type: String,
        unique: 'Username already taken',
        required: 'Please fill in a username...',
        trim: true
    },
    merchantName: {
        type: String,
        unique: 'Merchant Name already taken',
        sparse: true,
        trim: true
    },
    featuredMerchant: {
        type: Boolean,
        default: false
    },
    featuredMerchantExpiry: {
        type: Date
    },
    password: {
        type: String,
        default: '',
        validate: [validateLocalStrategyPassword, 'Password should be longer']
    },
    salt: {
        type: String
    },
    provider: {
        type: String,
        required: 'Provider is required'
    },
    providerData: {},
    additionalProvidersData: {},
    roles: {
        type: [{
            type: String,
            enum: ['user', 'admin']
        }],
        default: ['user']
    },
    updated: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    },
    /* For reset password */
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    verified: {
        type: Boolean,
        default: false
    },
    regCountry: {
        type: String
    },
    regNumber: {
        type: String
    },
    walletAddress: {
        type: String
    },
    hasWalletAddress: {
        type: Boolean,
        default: false
    },
    sellerRating: {
        type: Array,
        default: [],
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    subscriptionId: {
        type: String
    },
    subscriptionPlan: {
        type: Schema.ObjectId,
        ref: 'SubscriptionPlan'
    },
    braintreeSubscriptionLastChanged: {
        type: Date
    },
    subscriptionStatus: {
        type: [{
            type: String,
            enum: ['Inactive', 'Active', 'Cancelled']
        }],
        default: ['Inactive']
    },
    trialExpiryDate: {
        type: Date,
        default: trialDateExpire
    },
    subscriptionCancellationDate: {
        type: Date
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
    postcode: {
        type: String
    },
    telephoneNumber: {
        type: String
    },
    checkoutStreetAddress: {
        type: String
    },
    checkoutTown: {
        type: String
    },
    checkoutCountry: {
        type: String
    },
    checkoutPostcode: {
        type: String
    },
    checkoutTelephoneNumber: {
        type: String
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
    paymentMethodCreated: {
        type: Boolean,
        default: false
    },
    profileImage: {
        type: String,
        default: '/img/default-user.png'
    },
    userBannerName: {
        type: String,
        default: ''
    },
    completedOrders: {
        type: Number,
        default: 0
    },
    profileBlurb: {
        type: String,
        default: ''
    },
    PreferredCurrency: {
        type: String
    },
    faAscii: {
        type: String
    },
    faBase32: {
        type: String
    },
    faQr: {
        type: String
    },
    faHex: {
        type: String
    },
    faEnabled: {
        type: Boolean,
        default: false
    },
    shippingInformation: {
        type: String,
        default: ''
    },
    /* For updating profile */
    updateProfileToken: {
        type: String
    },
    updateProfileExpires: {
        type: String
    },
    verificationInProcess: {
        type: Boolean
    },
    userListings: [{
        type: Schema.Types.ObjectId,
        ref: 'Listing'
    }],
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }],
    pgpKey: {
        type: String,
        trim: true
    },
    merchantProfileAdded: {
        type: Boolean,
        default: false
    },
    loginHistory: [Date],
    verifyAccountToken: {
        type: String
    },
    emailAddressVerified: {
        type: Boolean
    },
    subscriptionExpiryReminderSent: {
        type: Boolean
    }
});

function getAddress(user, addressFields) {
    var isValid = true;
    _.forEach(addressFields, function(field) {
        if (!user[field]) {
            isValid = false;
            return false;
        }
    });

    if (isValid) {
        var values = _.map(addressFields, function(field) {
            return user[field];
        });

        return values.join(', ');
    } else {
        return '';
    }
}

UserSchema.virtual('fullAddress').get(function() {
    return getAddress(this, ['checkoutStreetAddress', 'checkoutTown', 'checkoutCountry', 'checkoutPostcode']);
});

UserSchema.virtual('merchantFullAddress').get(function() {
    return getAddress(this, ['checkoutStreetAddress', 'checkoutTown', 'checkoutCountry', 'checkoutPostcode']);
});

UserSchema.methods.updatePassword = function() {
    if (this.password && this.password.length > 6) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }
};

UserSchema.methods.hashPassword = function(password) {
    if (this.salt && password) {
        return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
    } else {
        return password;
    }
};

UserSchema.methods.authenticate = function(password) {
    return this.password === this.hashPassword(password);
};

UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
    var _this = this;
    var possibleUsername = username + (suffix || '');

    _this.findOne({
        username: possibleUsername
    }, function(err, user) {
        if (!err) {
            if (!user) {
                callback(possibleUsername);
            } else {
                return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
            }
        } else {
            callback(null);
        }
    });
};

UserSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('User', UserSchema);
