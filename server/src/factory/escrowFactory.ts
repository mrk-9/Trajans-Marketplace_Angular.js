import * as mongoose from 'mongoose';

var sendEmail = require('../services/emailService');
var emailMerges = require('../emails/emailMerges');
var escrowFactory = require('../factory/escrowFactory');
var Order = mongoose.model('Order');
var Escrow = mongoose.model('Escrow');
var request = require('request');
var User = mongoose.model('User');
var Purchase = mongoose.model('Purchase');
var Bitcoin = require('bitcoin');
var bitcoreFactory = require('./bitcoreFactory');
var _ = require('lodash');
var crypto = require('crypto');
var Q = require('q');
var mongo = require('mongodb');
var BSON = mongo.BSONPure;
var fs = require('fs-extra');

exports.markEscrowPaid = function(req, res) {
    var orderId = req.body.id;
    var userId = req.user._id;
    Order.findOne({
        '_id': orderId,
        'escrowSimple': false
    }).populate('multisigEscrow').exec(function(err, order) {
        bitcoreFactory.getUtxos(order.multisigEscrow.escrowAddress, function(address) {
            if (address.balance >= order.multisigEscrow.amount) {
                if (order.status !== 'ESCROW PAID' || order.status !== 'COMPLETED') {
                    Order.findOneAndUpdate({
                        '_id': orderId
                    }, {
                        status: 'ESCROW PAID',
                    }, null, function(err, success) {
                        if (err) {
                            return err;
                        }

                        // UPDATE ESCROW STATUS
                        Escrow.findById(order.multisigEscrow._id, function(err, escrow) {
                            if (err) return err;
                            if (escrow.status !== 'SIGNED WITH ONE KEY') {

                                // Make sure the escrow isn't already escrow paid - don't want to send multiple emails..
                                if(escrow.status !== 'ESCROW PAID') {
                                    var orderId = order._id.toString();
                                    User.findById(escrow.seller, function(err, seller) {
                                        var mergeBuyer = emailMerges.newModeratedPaymentInEscrow(req.user.firstName, escrow.amount, orderId, escrow.escrowAddress, req.user.username, seller.username, escrow._id.toString());
                                        var mergeSeller = emailMerges.newModeratedPaymentInEscrow(seller.firstName, escrow.amount, orderId, escrow.escrowAddress, req.user.username, seller.username, escrow._id.toString());
                                        
                                        var mailOptionsBuyer = {
                                            user: req.user,
                                            recipientEmail: req.user.email,
                                            templateName: 'Moderated Payment - Held in Escrow (buyer)',
                                            merge_vars: mergeBuyer,
                                            text: false
                                        };
                                        sendEmail.sendMandrillEmail(mailOptionsBuyer);

                                        var mailOptionsSeller = {
                                            user: seller,
                                            recipientEmail: seller.email,
                                            templateName: 'Moderated Payment - Held in Escrow (merchant)',
                                            merge_vars: mergeSeller,
                                            text: false
                                        };
                                        sendEmail.sendMandrillEmail(mailOptionsSeller);
                                    }); 
                                }

                                escrow.status = 'ESCROW PAID';
                                escrow.balance = address.balance;
                                escrow.save();
                            }
                        });

                        res.jsonp(order);
                    });
                }
            }
        });
    });
};

function addListingToPurcases(id, location) {
    var purchase = new Purchase();
    purchase.listingId = id;
    purchase.buyerLocation = location;
    purchase.save(function(err, purchase) {
        if (err)
            return err;
    });
}

function updateUserCompletedOrders(sellerId) {
    var query = {
        _id: sellerId
    };
    User.findOne(query, function(err, user) {
        var completed = user.completedOrders + 1;
        User.update({
            _id: user.id
        }, {
            completedOrders: completed
        }, function(err, user) {
            if (err) return err;
        });
    });
}
