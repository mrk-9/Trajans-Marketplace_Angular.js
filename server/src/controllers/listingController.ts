import * as mongoose from 'mongoose';

import constants from '../constants/constants';
import utilities from '../services/utilitiesService';
import emailService from '../services/emailService';
import helper from './_controllerHelper';
import listingRepository from '../repositories/listingRepository';
import uploadRepository from '../repositories/uploadRepository';
import userRepository from '../repositories/userRepository';

var Listing = mongoose.model('Listing');
var User = mongoose.model('User');
var Country = mongoose.model('Country');
var ListingImage = mongoose.model('ListingImage');
var Upload = mongoose.model('Upload');
var SubscriptionPlan = mongoose.model('SubscriptionPlan');
var moment = require('moment');
var AWS = require('aws-sdk');
var fs = require('fs');
var _ = require('lodash');
var Q = require('q');
var _atob = require('atob');

require('q-foreach')(Q);

AWS.config.update({
    accessKeyId: constants.awsUsername,
    secretAccessKey: constants.awsPassword,
    region: '',
    maxAsyncS3: 20,
    s3RetryCount: 3,
    s3RetryDelay: 1000,
    multipartUploadThreshold: 1048576, //(1 MB) 
    multipartUploadSize: 1048576, // (1 MB) 
});

var s3obj = new AWS.S3({
    params: {
        Bucket: 'trajansmarket',
        Key: constants.awsPassword
    }
});

export default {
    createListing,
    getCurrentListing,
    countAllActive,
    markPrimaryImage,
    updatePrimaryImageSrc,
    deleteListingImage,
    updateListing,
    deleteListing,
    list,
    listPopular,
    listingByID,
    listingsByUserId,
    updateViewCount,
    reportListing,
    toggleActiveStatus,
    toggleFeatured,
    getListingCountForSpecificCategory,
    hasAuthorization,
    getCountriesList
};

async function createListing(req, res) {
    try {
        let user = req.user;
        let listingData = req.body;
        let images = listingData.images;

        if (images && images.length) {
            let primaryImage = images[0];

            listingData.primaryImage = primaryImage;

            await uploadRepository.makeImagePrimary(primaryImage);
        }

        listingData.user = user;
        listingData.isVerifiedUser = user.verified;
        listingData.listingActive = true;

        if (!user.paymentMethodCreated) throw new Error('Cant create order without a payment method...');

        let listing = await listingRepository.addNewListing(listingData);

        if (listing) await userRepository.addListingForUser(listing);

        helper.sendData(listing, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

async function getCurrentListing(req, res) {
    try {
        let listingId = req.params.listingId;

        let listing = await listingRepository.getListingWithImage(listingId);

        helper.sendData(listing, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

async function countAllActive(req, res) {
    try {
        let count = await listingRepository.countActiveListings();

        helper.sendData({count}, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

function markPrimaryImage(req, res) {
    var listingId = req.body.listingId;
    var imageId = req.body.imageId;
    Listing.findOne({
            _id: listingId
        })
        .populate('images', 'path key croppedPath localPath')
        .exec(function(err, listing) {
            _.forEach(listing.images, function(image) {
                if (image._id.toString() === imageId) {
                    image.primaryImage = true;
                    listing.primaryImage = image._id;
                    listing.save(function(err, image) {
                        if (err) {
                            console.log(err);
                        }
                    });
                } else {
                    image.primaryImage = false;
                }
                image.save(function(err, image) {
                    if (err) {
                        console.log(err);
                    }
                });
            });
            res.jsonp({
                success: true
            });
        });
}

function updatePrimaryImageSrc(req, res) {
    var listingId = req.query.listingId;
    var imageId = req.query.imageId;

    ListingImage.findOneById(imageId, function(err, image) {
        if (err) {
            console.log(err);
            return res.status(400).send({
                message: helper.getErrorMessage(err)
            });
        } else {
            var newSrc = '';
            if (image.croppedPath) {
                newSrc = image.croppedPath;
            } else {
                newSrc = image.path;
            }
            Listing.findByIdAndUpdate(listingId, {
                primaryImage: newSrc
            }, function(err, listing) {
                if (err) {
                    console.log(err);
                    return res.status(400).send({
                        message: helper.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(listing);
                }
            });
        }

    });
}

function deleteListingImage(req, res) {
    var listingId = req.query.listingId;
    var imageId = req.query.imageId;
    console.log(req.query);
    Listing.findOne({
            _id: listingId
        })
        .populate('images')
        .exec(function(err, listing) {
            if (!err) {
                var image = _.find(listing.images, function(img, index) {
                    return img._id.toString() === imageId;
                });
                var index = _.findIndex(listing.images, function(img, index) {
                    return img._id.toString() === imageId;
                });
                if (image) {
                    if (image.primaryImage) {
                        res.json({
                            success: false,
                            error: 'You cannot delete the primary image...'
                        });
                    } else {
                        image.remove(function(err, success) {
                            if (err) {
                                console.log(err);
                            } else {
                                listing.images.splice(index, 1);
                                listing.save(function(err, listing) {
                                    if (err) {
                                        res.jsonp({
                                            errors: err,
                                            data: null,
                                            success: false
                                        });
                                    } else {
                                        var key = image.key;
                                        var deleteParams = {
                                            Bucket: 'trajansmarket',
                                            Key: key
                                        };
                                        s3obj.deleteObject(deleteParams, function(err, data) {
                                            if (err) {
                                                res.jsonp({
                                                    error: err,
                                                    data: null,
                                                    success: false
                                                });
                                            } else {
                                                res.jsonp({
                                                    error: null,
                                                    data: listing,
                                                    success: true
                                                });
                                            }
                                        });
                                    }

                                });
                            }
                        });

                    }
                } else {
                    Upload.findById(imageId, function(err, image) {
                        console.log(image);
                        if (err) {
                            res.json({
                                success: false,
                                error: 'Cant find image, if you have just uploaded the image, please save your listing first'
                            });
                        } else {
                            var key = image.key;
                            var deleteParams = {
                                Bucket: 'trajansmarket',
                                Key: key
                            };
                            s3obj.deleteObject(deleteParams, function(err, data) {
                                if (err) {
                                    res.jsonp({
                                        error: err,
                                        data: null,
                                        success: false
                                    });
                                } else {
                                    res.jsonp({
                                        error: null,
                                        data: image,
                                        success: true,
                                        isImage: true
                                    });
                                }
                            });
                        }
                    });
                }
            } else {
                res.json({
                    success: false,
                    error: 'Whoops an error occured...'
                });
            }
        });
}

async function updateListing(req, res) {
    try {
        let listing = req.listing;
        let listingData = req.body;

        let updatedListing = await listingRepository.updateListing(listing, listingData);

        helper.sendData(updatedListing, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

async function deleteListing(req, res) {
    try {
        let listing = req.listing;
        let userId = req.user._id;

        let isPassed = utilities.checkId(userId, [listing.user._id]);

        if (isPassed) {
            await listingRepository.removeListingById(listing._id);

            await userRepository.removeUserListing(userId, listing._id);
        }

        helper.sendData({}, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

function list(req, res) {
    var skip = parseInt(req.query.skip);
    Listing.find({
            quantityAvailable: {
                $gt: 0
            },
            listingActive: true
        }).sort({
            created: 'desc',
        })
        .skip(skip)
        .limit(10)
        .populate('primaryImage', 'path croppedPath localPath key')
        .populate('user', 'username merchantName sellerRating verified subscriptionStatus profileImage')
        .exec(function(err, listings) {
            if (err) {
                return res.status(400).send({
                    message: helper.getErrorMessage(err)
                });
            } else {

                var activeListings = [];

                // split listings which have a cropped primary image and ones that do not into 2 arrays
                _.forEach(listings, function(listing) {
                    if (listing.listingActive && listing.user.subscriptionStatus[0] !== 'Inactive') {
                        activeListings.push(listing);
                    }
                });

                res.jsonp(activeListings);
            }
        });
}

function listPopular(req, res) {
    Listing.find({
            quantityAvailable: {
                $gt: 0
            }
        }).sort({
            viewCount: 'desc'
        }).limit(4)
        .populate('primaryImage', 'path localPath croppedPath key')
        .populate('user', 'username merchantName verified subscriptionStatus profileImage').exec(function(err, listings) {
            if (err) {
                return res.status(400).send({
                    message: helper.getErrorMessage(err)
                });
            } else {
                var activeListings = [];
                for (var i = 0; i < listings.length; i++) {
                    if (listings[i].user.subscriptionStatus[0]) {
                        if (listings[i].user.subscriptionStatus[0] !== 'Cancelled' && listings[i].listingActive) {
                            activeListings.push(listings[i]);
                        }
                    }

                }
                res.jsonp(activeListings);
            }
        });
}

async function listingByID(req, res, next, id) {
    try {
        let listing = await listingRepository.getById(id, true);

        if (!listing) throw next(new Error(`Failed to load Listing with id: ${id}`));

        req.listing = listing;

        next();
    } catch (err) {
        return next(err);
    }
}

async function listingsByUserId(req, res, next) {
    try {
        let userId = req.user._id;

        let listings = await listingRepository.getListingsByUserId(userId);

        helper.sendData(listings, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

async function updateViewCount(req, res, next, id) {
    try {
        let user = req.user;

        let listing = await listingRepository.getById(id);

        if (!listing) throw new Error('Cannot find listing by id');

        // do not update view count if user looks at his listings
        if (user && user._id.toString() === listing.user.toString()) return helper.sendData({}, res);

        await listingRepository.increaseListingViewCount(id);

        helper.sendData({}, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

function reportListing(req, res) {
    var listingId = req.query.listingId;
    var message = req.query.message;
    if (listingId && message) {
        var merge_vars = [{
            'name': 'name',
            'content': req.user.username
        }, {
            'name': 'listingId',
            'content': req.body.subject
        }, {
            'name': 'description',
            'content': req.body.description
        }];
        var mailOptions = {
            user: req.user,
            recipientEmail: req.user.email,
            templateName: 'Support Request',
            merge_vars: merge_vars
        };
        emailService.sendMandrillEmail(mailOptions);
        res.jsonp({
            success: true
        });
    }
}

function toggleActiveStatus(req, res, next) {
    var query = {
        _id: req.body.listingId
    };
    Listing.findOne(query, function(err, listing) {
        if (err) throw err;
        // toggle the listing visibility status to the frond end
        listing.listingActive = req.body.listingActive;

        // save the listing
        listing.save(function(err) {
            if (err) throw err;
            res.jsonp(listing);
            console.log('Listing successfully updated!');
        });
    });
}

async function toggleFeatured(req, res) {
    try {
        let listingId = req.body.listingId;
        let featured = req.body.featured;

        let listing = await listingRepository.toggleListingFeatured(listingId, featured);

        helper.sendData(listingId, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

function getListingCountForSpecificCategory(req, res, next, catAlias) {
    Listing.find().count({
        category: catAlias,
        quantityAvailable: {
            $gt: 0
        },
        listingActive: true
    }, function(err, count) {
        if (err) {
            console.log(err);
            return res.status(400).send({
                message: helper.getErrorMessage(err)
            });
        } else {
            if (!count) {
                res.jsonp({
                    categoryCount: 0
                });
            } else {
                res.jsonp({
                    categoryCount: count
                });
            }

        }
    });
}

//Listing authorization middleware
function hasAuthorization(req, res, next) {
    if (req.listing.user.id !== req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
}

function getCountriesList(req, res) {
    Country.find().sort().exec(function (err, countries) {
        if (err) {
            return res.status(400).send({
                message: helper.getErrorMessage(err)
            });
        } else {
            res.jsonp(countries);
        }
    });
}
