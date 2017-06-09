import * as mongoose from 'mongoose';

let Schema = mongoose.Schema;

let ListingSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please enter a product name',
        trim: true
    },
    category: {
        type: String,
        default: '',
        required: 'Please select a product category',
        trim: true
    },
    sku: {
        type: String
    },
    primaryCategory: {
        type: String,
        default: '',
        trim: true
    },
    secondaryCategory: {
        type: String,
        default: ''
    },
    tertiaryCategory: {
        type: String,
        default: '',
        required: 'Please select the item type',
        trim: true
    },
    priceFiat: {
        type: Number,
        required: 'Please enter a price',
        default: '',
    },
    oldPriceFiat: {
        type: Number,
        default: '',
    },
    priceBTC: {
        type: Number,
        default: '',
        trim: true
    },
    shippingInformation: {
        type: String,
        required: 'Please specify a return policy',
    },
    multiple: {
        type: String
    },
    isDigital: {
        type: Boolean,
        default: false
    },
    quantityAvailable: {
        type: Number,
        default: 1
    },
    condition: {
        type: String,
        default: 'New'
    },
    shippingOptions: {
        type: Array,
        required: 'Please add at least one shipping method'
    },
    productLink: {
        type: String,
        trim: true
    },
    keyFeatures: {
        type: [String],
        trim: true
    },
    description: {
        type: String,
        default: '',
        required: 'Please enter a description',
        trim: true
    },
    primaryImage: {
        type: Schema.Types.ObjectId,
        ref: 'Upload'
    },
    images: [{
        type: Schema.ObjectId,
        ref: 'Upload'
    }],
    imagesDownloaded: {
        type: Boolean,
        default: false
    },
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    purchases: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    coinJarEnabled: {
        type: Boolean,
        default: false
    },
    bitcoinEnabled: {
        type: Boolean,
        default: false
    },
    userActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isVerifiedUser: {
        type: Boolean,
        default: false
    },
    mainFeaturedListing: {
        type: Boolean
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    viewCount: {
        type: Number,
        default: 0
    },
    listingActive: {
        type: Boolean,
        default: false
    },
    itemLocation: {
        type: String,
        required: 'Please enter the item dispatch location',
        trim: true
    },
    defaultShippingInformation: {
        type: Boolean,
        default: false
    },
    bulkyItem: {
        type: Boolean,
        default: false
    },
    offerBuyerProtection: {
        type: Boolean,
        default: false
    },
    offerBitcoinDirect: {
        type: Boolean,
        default: false
    },
    offerBuyerProtectionCurrent: {
        type: Boolean,
        default: false
    },
    offerBitcoinDirectCurrent: {
        type: Boolean,
        default: false
    },
    etaDeliveryNational: {
        type: Number,
        required: 'Please enter the estimated number of days the item will take for national delivery'
    },
    etaDeliveryInternational: {
        type: Number
    }
});

module.exports = mongoose.model('Listing', ListingSchema);
