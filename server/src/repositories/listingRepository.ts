import * as mongoose from 'mongoose';
import * as _ from 'lodash';

let Listing = mongoose.model('Listing');

export default {
    getById,
    getActiveListingsByCategory,
    performSearch,
    searchListings,
    minusListingQuantity,
    increaseListingQuantity,
    updateListingPaymentMethods,
    checkAndRevertPreviousListingMethod,
    countActiveListings,
    addNewListing,
    toggleListingFeatured,
    updateListing,
    updateVerifiedStatus,
    increaseListingViewCount,
    getListingsByUserId,
    removeListingById,
    getListingWithImage
};

async function getById(id, includeImages = false) {
    if (includeImages) {
        return await Listing.findById(id)
            .populate('images', 'path localPath croppedPath key primaryImage')
            .populate('primaryImage', 'path localPath croppedPath key')
            .populate('user', 'username merchantName created sellerRating verified profileImage userBannerName hasUploadedBanner country completedOrders');
    }

    return await Listing.findById(id);
}

async function getActiveListingsByCategory(category) {
    let query = {
        quantityAvailable: {
            $gt: 0
        },
        listingActive: true,
        category: category || {
            $ne: null
        }
    };

    return await Listing.find(query)
        .sort('-created')
        .populate('images', 'path')
        .populate('primaryImage', 'path')
        .populate('user', 'username profileImage verified subscriptionStatus merchantName');
}

async function performSearch(searchQuery) {
    let query: any = {
        quantityAvailable: {
            $gt: 0
        },
        listingActive: true,
        $and: [{
            name: new RegExp(searchQuery.keyword, 'i')
        }, {
            category: searchQuery.category || {
                $ne: null
            }
        }]
    };

    let count = await Listing.count(query);

    return await Listing.find(query)
        .sort('-created')
        .populate('images', 'path')
        .populate('primaryImage', 'path')
        .populate('user', 'merchantName username hasUploadedImage verified subscriptionStatus userImageName profileImage')
        .skip(searchQuery.skip)
        .limit(searchQuery.limit)
        .then((listings) => {
            return {
                listings,
                count
            }
        });
}

async function searchListings(searchQuery) {
    let query: any = {
        quantityAvailable: {
            $gt: 0
        },
        listingActive: true,
        user: searchQuery.userId || {
            $ne: null
        },
        offerBitcoinDirect: searchQuery.offerBitcoinDirect,
        offerBuyerProtection: searchQuery.offerBuyerProtection,
        $and: [{
            name: new RegExp(searchQuery.keyword, 'i')
        }, {
            category: searchQuery.category || {
                $ne: null
            },
            primaryCategory: searchQuery.primaryCategory || {
                $ne: null
            },
            secondaryCategory: searchQuery.secondaryCategory || {
                $ne: null
            },
            tertiaryCategory: searchQuery.itemType || {
                $ne: null
            }
        }]
    };

    if (!searchQuery.freeShipping || !searchQuery.standardShipping) {
        if (searchQuery.freeShipping) {
            query.shippingOptions = {
                $elemMatch: {shippingCost: 0}
            };
        } else if(searchQuery.standardShipping) {
            query.shippingOptions = {
                $elemMatch: {shippingCost: {$gt: 0}}
            };
        }
    }

    if (!searchQuery.verifiedMerchant || !searchQuery.unverifiedMerchant) {
        if (searchQuery.verifiedMerchant) {
            query.isVerifiedUser = true;
        } else if (searchQuery.unverifiedMerchant) {
            query.isVerifiedUser = false;
        }
    }

    if (searchQuery.maxPrice === 1000) {
        query.priceFiat = {
            $gt: searchQuery.minPrice
        };
    } else {
        query.priceFiat = {
            $gt: searchQuery.minPrice,
            $lt: searchQuery.maxPrice
        };
    }

    let sort = '';

    switch (searchQuery.orderBy) {
        case 'created':
            sort = '-created';
            break;
        case 'priceFiatDesc':
            sort = '-priceFiat';
            break;
        case 'priceFiatAsc':
            sort = 'priceFiat';
            break;
        case 'nameAsc':
            sort = 'name';
            break;
        case 'nameDesc':
            sort = '-name';
            break;
        default:
            sort = '-created';
            break;
    }

    let count = await Listing.count(query);

    return await Listing.find(query)
        .sort(sort)
        .populate('images', 'path')
        .populate('primaryImage', 'path')
        .populate('user', 'merchantName username hasUploadedImage verified subscriptionStatus userImageName profileImage')
        .skip(searchQuery.skip)
        .limit(searchQuery.limit)
        .then((listings) => {
            return {
                listings,
                count
            }
        });
}

async function minusListingQuantity(listingId, quantity) {
    let listing = await getById(listingId);

    if (!listing || !listing.quantityAvailable) return;

    listing.quantityAvailable -= quantity;

    await listing.save();

    return listing;
}

async function increaseListingQuantity(listingId, quantity) {
    let update = {
        $inc: {
            quantityAvailable: quantity
        }
    };

    return await Listing.update({_id: listingId}, update);
}

async function updateListingPaymentMethods(userId) {
    let listings = await Listing.find({user: userId});

    listings.forEach(listing => {
        // Save original values
        listing.offerBuyerProtectionCurrent = listing.offerBuyerProtection;
        listing.offerBitcoinDirectCurrent = listing.offerBitcoinDirect;

        // Now update to new values and save
        listing.offerBuyerProtection = true;
        listing.offerBitcoinDirect = false;

        listing.save();
    });
}

async function checkAndRevertPreviousListingMethod(userId) {
    let listings = await Listing.find({user: userId});

    listings.forEach(listing => {
        listing.offerBuyerProtection = listing.offerBuyerProtectionCurrent;
        listing.offerBitcoinDirect = listing.offerBitcoinDirectCurrent;

        listing.save();
    });
}

async function countActiveListings() {
    let query = {
        listingActive: true,
        quantityAvailable: {
            $gt: 0
        }
    };

    return await Listing.where(query).count();
}

async function addNewListing(listingData) {
    let listing = new Listing(listingData);

    return await listing.save();
}

async function toggleListingFeatured(id, featured) {
    let listing = await getById(id);

    listing.isFeatured = featured;

    return await listing.save();
}

async function updateListing(listing, listingData) {
    listing = _.extend(listing, listingData);

    listing.primaryCategory = listing.primaryCategory || '';
    listing.secondaryCategory = listing.secondaryCategory || '';

    return await listing.save();
}

async function updateVerifiedStatus(userId, verified) {
    let listings = await Listing.find({user: userId});

    listings.forEach(listing => {
        listing.isVerifiedUser = verified;

        listing.save();
    });
}

async function increaseListingViewCount(id) {
    let update = {
        $inc: {
            viewCount: 1
        }
    };

    return await Listing.update({_id: id}, update);
}

async function getListingsByUserId(userId) {
    let query = {
        user: userId
    };

    return await Listing.find(query)
        .sort('-created')
        .populate('images', 'path localPath croppedPath key')
        .populate('primaryImage', 'path localPath croppedPath key')
        .populate('user', 'username');
}

async function removeListingById(id) {
    let query = {
        _id: id
    };

    return await Listing.remove(query);
}

async function getListingWithImage(id) {
    let query = {
        _id: id
    };

    return await Listing.findOne(query)
        .populate('images', 'path croppedPath localPath key primaryImage')
        .populate('primaryImage', 'path croppedPath localPath key primaryImage')
        .populate('user', 'username merchantName created sellerRating verified profileImage userBannerName hasUploadedBanner ' +
            'country completedOrders profileBlurb bitposEnabled hasWalletAddress subscriptionPlan')
        .then((listing) => {
            return Listing.populate(listing, {
                path: 'user.subscriptionPlan',
                model: 'SubscriptionPlan'
            });
        });
}