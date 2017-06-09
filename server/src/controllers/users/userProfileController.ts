import * as _ from 'lodash';
import * as mongoose from 'mongoose';
import * as GooglePlaces from 'google-places';
import * as fs from 'fs';
import * as async from 'async';
import * as crypto from 'crypto';
import * as moment from 'moment';

import helper from '../_controllerHelper';
import bitcoreFactory from '../../factory/bitcoreFactory';
import emailService from '../../services/emailService';
import emailMerges from '../../emails/emailMerges';
import userRepository from '../../repositories/userRepository';
import uploadRepository from '../../repositories/uploadRepository';
import reviewRepository from '../../repositories/reviewRepository';
import orderRepository from '../../repositories/orderRepository';

let User = mongoose.model('User');
let UserProfile = mongoose.model('UserProfile');
let Order = mongoose.model('Order');
let SubscriptionPlan = mongoose.model('SubscriptionPlan');
let Listing = mongoose.model('Listing');
let places = new GooglePlaces('AIzaSyAto9NcDIWd_6xy3gtZMzVMiS5q5Ms7oF0');

export default {
    changeProfile,
    update,
    addListingToUser,
    removeListingFromUser,
    me,
    getUser,
    findFeaturedMerchants,
    countAllActiveMerchants,
    updateLoginHistory,
    findByUsername,
    getSubscriptionInfo,
    getLocationSearch,
    verifyUser,
    addReview,
    getReviews,
    supportRequest
}

function changeProfile(req, res, next) {
    //Validation
    var profile = req.body;
    var isValid = true;
    if (profile.walletAddress) {
        //Validate Bitcoin Address
        if (bitcoreFactory.validateAddress(profile.walletAddress)) {
            isValid = true;
        } else {
            isValid = false;
            res.jsonp({
                error: 'Invalid bitcoin payment address.'
            });
        }
    }
    if (isValid) {
        async.waterfall([
            // Generate random token
            function(done) {
                crypto.randomBytes(5, function(err, buffer) {
                    var token = buffer.toString('hex');
                    done(err, token);
                });
            },
            // Save users updated profile
            function(token, done) {
                var query = {
                    _id: req.user.id
                };
                User.findOneAndUpdate(query, {
                    updateProfileToken: token,
                    updateProfileExpires: Date.now() + 3600000 // 1 hour  
                }, function(err, profile) {
                    console.error(err);
                    return;
                });

                UserProfile.findOneAndUpdate(query, {
                    firstName: profile.firstName || '',
                    lastName: profile.lastName || '',
                    merchantName: profile.merchantName || '',
                    email: profile.email || '',
                    bitposUsername: profile.bitposUsername || '',
                    bitposPassword: profile.bitposPassword || '',
                    bitposEnabled: profile.bitposPassword && profile.bitposUsername ? true : false,
                    walletAddress: profile.walletAddress || '',
                    hasWalletAddress: profile.walletAddress ? true : false,
                    addressAdded: profile.walletAddress ? true : false,
                    paymentMethodCreated: (profile.bitposPassword && profile.bitposUsername) || profile.walletAddress ? true : false,
                    streetAddress: profile.streetAddress || '',
                    town: profile.town || '',
                    country: profile.country || '',
                    postcode: profile.postcode || '',
                    telephoneNumber: profile.telephoneNumber || '',
                    checkoutStreetAddress: profile.checkoutStreetAddress || '',
                    checkoutTown: profile.checkoutTown || '',
                    checkoutCountry: profile.checkoutCountry || '',
                    checkoutPostcode: profile.checkoutPostcode || '',
                    checkoutTelephoneNumber: profile.checkoutTelephoneNumber || '',
                    profileBlurb: profile.profileBlurb || '',
                    pgpKey: profile.pgpKey || '',
                    /* For updating profile */
                    updateProfileToken: token,
                    updateProfileExpires: Date.now() + 3600000,
                    merchantProfileAdded: profile.streetAddress || profile.town || profile.country || profile.telephoneNumber || profile.postCode ? true : false
                }, {
                    upsert: true
                }, function(err, profile) {
                    done(err, token);
                });
            },
            function(token, done) {

                //Send Settings Update Token Email
                var merge_vars = emailMerges.settingsUpdateRequest(req.user.firstName, 'http://' + req.headers.host + '/profile/update/' + token);

                var mailOptions = { 
                  user: req.user,
                  recipientEmail: req.user.email,
                  templateName : 'Account settings update - request',
                  merge_vars: merge_vars                     
                };

                emailService.sendMandrillEmail(mailOptions);

                done();

                res.send({
                    message: 'An email has been sent to ' + req.user.email + ' with further instructions.'
                });
            }
        ], function(err) {
            console.log(err);
            if (err) return next(err);
        });
    }
}

function update(req, res, next) {
    var message = null;
    async.waterfall([
        // Find user profile by random token
        function(done) {
            UserProfile.findOne({
                    updateProfileToken: req.params.token,
                    updateProfileExpires: {
                        $gt: Date.now()
                    }
                },
                function(err, profile) {
                    if (!err && profile) {
                        done(err, profile);
                    } else {
                        return res.status(400).send({
                            message: 'Profile reset token is invalid or has expired.'
                        });
                    }
                });
        },
        function(profile, done) {
            profile = profile.toObject();
            delete profile._id;
            User.findOneAndUpdate({
                updateProfileToken: req.params.token
            }, profile, function(err, user) {
                if (err) {
                    return res.status(400).send({
                        message: 'Oops something went wrong!'
                    });
                } else {
                    saveUser(user, res, next);
                }
            });
        }
    ], function(err) {
        if (err) return next(err);
    });
}

function addListingToUser(req, res, next) {
    var listing = req.body.listing;
    var query = {
        _id: req.user.id
    };

    User.findOneAndUpdate(query, {
        $push: {
            userListings: listing._id
        },
    }, { 
        upsert: true 
    })
    .populate('userListings')
    .exec(function(err, user) {
        if (err) {
            return res.status(400).send({
                message: 'Oops something went wrong!'
            });
        } else {
            res.jsonp({'userListings': user.userListings});
        }
    });
}

async function removeListingFromUser(req, res, next, id) {
    try {
        let userId = req.user.id;
        let listingId = mongoose.Types.ObjectId(id);

        let user = await userRepository.removeUserListing(userId, listingId);

        helper.sendData({userListings: user.userListings}, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

function me(req, res) {
    User.findById(req.user._id).populate('subscriptionPlan', 'group').exec(function(user){
        res.jsonp(user || null);
    });
    //res.jsonp(req.user || null);
}

async function getUser(req, res) {
    try {
        let userId = req.params.userId;

        let user = await userRepository.getUser(userId);

        helper.sendData(user, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

async function findFeaturedMerchants(req, res) {
    try {
        let users = await userRepository.getFeaturedMerchantUsersWithListings();

        //get two random users
        users = _.slice(_.shuffle(users), 0, 2);

        for (let user of users) {
            for (let listing of user.userListings) {
                let image = await uploadRepository.getImageById(listing.primaryImage);

                listing.primaryImage = image;
            }
        }

        helper.sendData(users, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

async function countAllActiveMerchants(req, res) {
    try {
        let count = await userRepository.countAllActiveMerchants();

        helper.sendData({count}, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

function updateLoginHistory(req, res) {
    var query = {
        _id: req.user.id
    };
    User.findOneAndUpdate(query, {
            $push: {
                'loginHistory': moment()
            },
        }, {
            upsert: true
        },
        function(err, user) {
            if (err) {
                console.log(err);
                return res.status(400).send({
                    message: 'Oops something went wrong!'
                });
            }
        });
}

function findByUsername(req, res) {
    User.find({
        username: req.params.username
    }, {
        username: 1,
        merchantName: 1
    }).exec(function(err, seller) {
        if (err) console.log(err);
        res.jsonp(seller[0]);
    });
}

function getSubscriptionInfo(req, res) {
    User.findById(req.params.currentUserId, {
        bitposUsername: 0,
        bitposPassword: 0,
        password: 0,
        provider: 0,
        roles: 0,
        verified: 0,
        walletAddress: 0,
        walletBalance: 0,
        subscriptionId: 0,
        trialExpiryDate: 0,
        faAscii: 0,
        faBase32: 0,
        faQr: 0,
        faHex: 0,
        faEnabled: 0,
        paymentMethodCreated: 0,
        resetPasswordToken: 0,
        resetPasswordExpires: 0
    }).populate('user', 'subscriptionPlan').exec(function(err, user) {
        if (user) {
            SubscriptionPlan.find({
                _id: user.subscriptionPlan
            }, function(err, plan) {
                res.jsonp(plan);
            });
        } else {
            console.log(err);
        }
    });
}

function getLocationSearch(req, res) {
    var location = req.query.location;
    places.autocomplete({
        input: location,
        types: '(cities)'
    }, function(err, response) {
        var local = [];
        for (var i = 0; i < response.predictions.length; i++) {
            local.push(response.predictions[i].description);
        }
        res.jsonp(local);
    });
}

function verifyUser(req, res) {
    //TODO use mandrill template
    return res.send({
        success: true
    });
    fs.readdir('uploads/', function(err, files) {
        if (err) {
            throw err;
        }
        var mailOptions = {
            user: req.user,
            subject: 'User: ' + req.user.username + ' Has Uploaded They\'re Verification Documents',
            emailHTML: 'templates/verify-user-email'
        };
        //emailService.sendEmail(req, res, mailOptions);
        if (req.body) {
            var query = {
                _id: req.user.id
            };
            var update = {
                regCountry: req.body.regCountry || '',
                regNumber: req.body.regNumber || '',
                verificationInProcess: true
            };
            User.findOneAndUpdate(query, update, null, function(err, user) {
                if (err) {
                    console.log(err);
                }
            });
        }
    });
}

async function addReview(req, res) {
    try {
        let reviewData = req.body;

        reviewData.createdBy = req.user;

        let review = await reviewRepository.createReview(reviewData);

        if (!review) throw new Error('Cannot add review');

        await userRepository.updateSellerProfileReviewScore(review.user, review.rating);

        await orderRepository.markOrderItemAsReviewed(review.orderId);

        let recipient = await userRepository.getUserById(review.user);

        sendReviewReceivedEmail(recipient, review.createdBy, review.orderId);

        helper.sendData(review, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

async function getReviews(req, res, next, id) {
    try {
        let reviews = await reviewRepository.getAllReviewsForUser(id);

        helper.sendData(reviews, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

function supportRequest(req, res) {
    var merge_vars = [{
        'name': 'name',
        'content': req.user.username
    }, {
        'name': 'subject',
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

//helper methods

function saveUser(user, res, next) {
    user = user.toObject();
    delete user._id;
    User.update({
        _id: user.id
    }, user, function(err) {
        if (err) {
            return res.status(400).send({
                message: helper.getErrorMessage(err)
            });
        } else {
            // SEND EMAIL
            var merge_vars = emailMerges.settingsUpdatedConfirmation(user.firstName, moment().format('h:mma'), moment().format('MMMM Do YYYY'));
            var mailOptions = {
                user: user,
                recipientEmail: user.email,
                templateName: 'Account settings updated - confirmation',
                merge_vars: merge_vars
            };
            emailService.sendMandrillEmail(mailOptions);
            res.redirect('/#!/profile/update/success');
        }
    });
}

function sendReviewReceivedEmail(recipient, createdBy, orderId) {
    let mergeVars = emailMerges.reviewReceived(recipient.firstName, orderId);

    let mailOptions = {
        user: createdBy,
        recipientEmail: recipient.email,
        templateName: 'Review received (Merchant/Buyer)',
        merge_vars: mergeVars
    };

    emailService.sendMandrillEmail(mailOptions);
}
