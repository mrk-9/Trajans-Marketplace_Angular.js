import * as Braintree from 'braintree';
import * as every from 'every-moment';
import * as fs from 'fs-extra';
import * as moment from 'moment';
import * as currencyFormatter from 'currency-formatter';
import * as _ from 'lodash';
import * as dateFns from 'date-fns';

import constants from '../constants/constants';
import bitcoinService from './bitcoinService';
import blogPostRepository from '../repositories/blogPostRepository';
import featuredRepository from '../repositories/featuredRepository';
import externalApiRepository from '../repositories/externalApiRepository';
import marketCapRepository from '../repositories/marketCapRepository';
import logger from './loggerService';
import orderFactory from '../factory/orderFactory';

let escrowStatuses = constants.escrowStatuses;
const CronJob = require('cron').CronJob;

export default {
    updatePriceTicker,
    marketCap,
    blogPosts,
    checkFeaturedExpired,
    sendReviewEmails,
    checkUserSubscriptions,
    deleteLocalImages,
    checkOrdersExpired,
    sendPurchaseNotification
};

function writeFile(exchangeObj) {
    var file = './exchangerates.json';
    fs.outputJson(file, exchangeObj, function(err) {
        if (err) {
            console.log(err);
        }
    });
}

async function marketCapImport() {
    try {
        let coinCap = await externalApiRepository.getCoinCapGlobal();

        if (!coinCap) return;

        let rateData = await externalApiRepository.getRateToConvertUSDtoAUD();

        let rate = rateData.query.results.rate.Rate;

        let btcInAUD = coinCap.btcCap * rate;
        let btc = formatMarketCap(btcInAUD);

        let altInAUD = coinCap.altCap * rate;
        let alt = formatMarketCap(altInAUD);

        let total = formatMarketCap(btcInAUD + altInAUD);

        let marketCap = await marketCapRepository.getMarketCap();

        if (marketCap) {
            await marketCapRepository.updateMarketCap(marketCap, btc, alt, total);
        } else {
            await marketCapRepository.createMarketCap(btc, alt, total);
        }
    } catch (err) {
        logger.error(err);
    }
}

function updatePriceTicker() {
    var self = this;
    var getCurrencies = function() {
        var currencies = constants.currencies;
        var tickerObject = {};
        currencies.forEach(function(currency) {
            bitcoinService.getRate(currency).end(function(err, res) {
                if (!err && (res && res.body && res.body.rate)) {
                    tickerObject[currency.toLowerCase()] = {
                        spot: res.body.rate / 100
                    };
                    writeFile(tickerObject);
                } else {
                    console.log('Error updating the rate');
                    console.log(err);
                }
            });
        });
        logger.info('Bitpos Exchange Rates were updated.');
    };
    getCurrencies();
    every(0.5, 'minute', function() {
        getCurrencies();
    });
}

function marketCap() {
    marketCapImport();
    every(0.5, 'minute', function() {
        marketCapImport();
    });
}

async function importBlogPosts() {
    try {
        let blogs = await externalApiRepository.getBlogPosts();

        await blogPostRepository.updateBlogPosts(blogs);
    } catch (err) {
        logger.error(err);
    }
}

function blogPosts() {
    importBlogPosts();

    every(15, 'minute', () => {
        importBlogPosts();
    });
}

function checkFeaturedExpired() {
    every(5, 'seconds', function() {
        checkFeatured();
    });
}

async function checkFeatured() {
    try {
        let featured = await featuredRepository.getFeaturedPending();

        if (_.isEmpty(featured)) return;

        for (let item of featured) {
            let isDateAfter = dateFns.isAfter(new Date(), item.expires);

            if (item.balance === 0 && isDateAfter) {
                await featuredRepository.removeFeature(item._id, null);
            }
        }
    } catch (err) {
        logger.error(err);
    }
}

function sendReviewEmails() {
    var mongoose = require('mongoose'),
        Users = mongoose.model('User'),
        sendEmail = require('../services/emailService'),
        emailMerges = require('../emails/emailMerges'),
        _ = require('lodash'),
        moment = require('moment'),
        Order = mongoose.model('Order');

    // runs at 1am every day
    new CronJob('0 1 * * *', function() {
        Order.find({
                $and: [
                    { $or: [{ status: escrowStatuses.pa }, { status: escrowStatuses.ep }, { status: escrowStatuses.co }] }, // PAID, ESCROW PAID, COMPLETE
                    { shippingStatus: 'Shipped' },
                    { created: { '$gte': moment().subtract(1, 'months') } } // created in the last 30 days
                ]
            })
            .populate('user', '_id firstName email checkoutCountry reviewReminderSent')
            .populate('order_items', 'itemLocation')
            .exec(function(err, orders) {
                if (err) {
                    console.log(err);
                } else {
                    _.forEach(orders, function(order, key) {
                        if (!order.user.reviewReminderSent && order.etaDeliveryNational && order.etaDeliveryInternational) {
                            var sendDate;
                            // Check whether this order is national or international.
                            if (order.user.checkoutCountry.indexOf('order_items[0].itemLocation') >= 0) {
                                sendDate = moment(order.created).add(order.etaDeliveryNational, 'days');
                            } else {
                                sendDate = moment(order.created).add(order.etaDeliveryInternational, 'days');
                            }
                            if (moment() >= sendDate) {
                                // SEND 'please add review' EMAIL
                                var merge_vars = emailMerges.settingsUpdatedConfirmation(order.user.firstName, order._id);
                                var mailOptions = {
                                    user: order.user,
                                    recipientEmail: order.user.email,
                                    templateName: 'Review - leave a review (Merchant/Buyer)',
                                    merge_vars: merge_vars
                                };
                                sendEmail.sendMandrillEmail(mailOptions);

                                Users.findByIdAndUpdate(order.user._id, { reviewReminderSent: true }, function(err, user) {});
                            }
                        }
                    });
                }
            });
    }, null, true, null);
}

function checkUserSubscriptions() {
    var mongoose = require('mongoose'),
        Users = mongoose.model('User'),
        Featured = mongoose.model('Featured'),
        sendEmail = require('../services/emailService'),
        Listing = mongoose.model('Listing'),
        Category = mongoose.model('Category'),
        gateway = Braintree.connect({
            environment: Braintree.Environment.Sandbox,
            merchantId: '9bwgmbf69dzcxncp',
            publicKey: 'bt8qdv24qbb5wcy4',
            privateKey: '9aa1380f681de0f07fb6933edb05df4b'
        });

    // runs at 1am every day
    new CronJob('0 1 * * *', function() {
        Users.find().populate('subscriptionPlan', 'name maxListings').exec(function(err, users) {
            if (err) {
                console.log(err);
            } else {
                for (var i = 0; i < users.length; i++) {

                    // trial cancellation
                    if (users[i].subscriptionStatus[0] === 'Trial') {
                        var trialDaysRemaining = moment(users[i].trialExpiryDate).startOf('day').diff(moment().startOf('day'), 'days');
                        if (trialDaysRemaining < 0) {
                            cancelUserTrial(users[i]);
                            console.log(users[i].username + ' has finished the trial and their subscription in now cancelled');
                        } else {
                            console.log('No trial subscriptions have been cancelled.');
                        }
                    }

                    if (users[i].featuredMerchant && moment().isAfter(users[i].featuredMerchantExpiry)) {
                        removeFeaturedMerchantStatus(users[i]);
                        console.log(users[i].username + 's featured merchant period is now over and the status has been removed from the account');
                    }
                }
            }
        });

    }, null, true, null);

    function cancelUserTrial(user) {
        var update = {
            subscriptionStatus: ['Cancelled']
        };
        Users.update({
            _id: user.id
        }, update, function(err, success) {
            if (err) {
                console.log(err);
            }
        });
    }

    function removeFeaturedMerchantStatus(user) {
        var update = {
            featuredMerchant: false
        };
        Users.update({
            _id: user.id
        }, update, function(err, success) {
            if (err) {
                console.log(err);
            }

            Featured.remove({ user: user._id}, function (err, success) {
                if (err) console.log(err);
            });
        });
    }
}

function deleteLocalImages() {
    var mongoose = require('mongoose'),
        Listing = mongoose.model('Listing'),
        Upload = mongoose.model('Upload'),
        _ = require('lodash'),
        fs = require('fs');

    new CronJob('0 1 * * *', function() {
        Listing.find({ 'imagesDownloaded': true })
            .populate('images')
            .exec(function(err, listings) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(listings.length);
                    _.forEach(listings, function(listing) {
                        _.forEach(listing.images, function(image) {
                            var path = 'public/' + image.localPath;
                            fs.unlink(path, function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    listing.imagesDownloaded = false;
                                    listing.save();
                                }
                            });
                        });
                    });
                }
            });
    }, null, true, null);
}

function updateOrder(Order, order, io) {
    var query = {
        _id: order._id
    };
    var update = {
        status: 'EXPIRED'
    };
    if (order.status !== 'COMPLETED' && order.status !== 'ESCROW PAID') {
        Order.findOneAndUpdate(query, update, null, function(err, order) {
            if (err) {
                console.log(err);
            } else {
                io.sockets.in(order._id).emit('orderExpired', {
                    'orderExpired': true,
                    'orderId': order._id
                });

                orderFactory.addListingQuantities(order.order_items);
            }
        });
    }
}

function checkOrdersExpired(io) {
    new CronJob('1 */1 * * * *', function() {
        var mongoose = require('mongoose');
        var Order = mongoose.model('Order');
        var now = moment();
        Order.find({
            'status': 'PENDING',
        }).sort('-created').exec(function(err, orders) {
            for (var i = 0; i < orders.length; i++) {
                var minutesAgo = moment(orders[i].created).diff(now, 'minutes'); // how many minutes ago the order was created
                var minutesToExpire = orders[i].multisigEscrow ? constants.escrowExpiresMultisig : constants.escrowBitpos; // how many minutes until order expires
                if (minutesAgo <= minutesToExpire) {
                    updateOrder(Order, orders[i], io);
                }
            }
        });
    }, null, true, null);
}

function retrievePurcase(purchases, io) {
    var mongoose = require('mongoose');
    var Listing = mongoose.model('Listing');
    var Purchase = mongoose.model('Purchase');
    if (purchases.length) {
        var amountOfPurchases = purchases.length;
        var randNumber = Math.floor(Math.random() * amountOfPurchases);
        var randomPurchase = purchases[randNumber];
        Listing.findOne(randomPurchase.listingId, function(err, listing) {
            Purchase.findOne({
                listingId: randomPurchase.listingId
            }, function(err) {
                if (err) {
                    return err;
                } else {
                    Purchase.remove(function() {
                        if (err) return err;
                    });
                }
            });
            if (err) return err;
            var emitMessage = {
                listing: listing,
                purchaseLocation: randomPurchase.buyerLocation
            };
            io.sockets.emit('purcaseItem', emitMessage);
        });
    }
}

function sendPurchaseNotification(io) {
    new CronJob('10 */1 * * * *', function() {
        var mongoose = require('mongoose');
        var Purchase = mongoose.model('Purchase');
        Purchase.find(function(err, purchases) {
            retrievePurcase(purchases, io);
        });
    }, null, true, null);
}

//helper methods
function formatMarketCap(value) {
    const format = {code: 'AUD', symbol: '$', thousand: ','};

    let result = currencyFormatter.format(value, format).toString();

    result = result.split(',')[0] + '.' + result.split(',')[1];

    result = result.slice(0, -1);

    return result;
}
