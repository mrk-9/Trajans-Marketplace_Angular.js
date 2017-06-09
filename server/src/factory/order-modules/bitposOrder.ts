import * as Bitpos from 'bitpos-node';
import * as mongoose from 'mongoose';
import * as _ from 'lodash';

import constants from '../../constants/constants';
import emailMerges from '../../emails/emailMerges';
import sendEmail from '../../services/emailService';
import bitcoreFactory from '../bitcoreFactory';
import utilityService from '../../services/utilitiesService';

let Order = mongoose.model('Order');
let User = mongoose.model('User');

export default {
    processBitPos,
    updateBitposOrder
};

function processBitPos(order, user, req, res, callback) {
    let self = this;
    let createOrderUrl = constants.bitPosBaseUrl + constants.orderUrl;
    let bitposUsername = user.bitposUsername;
    let bitposPassword = user.bitposPassword;

    let body = {
        currency: 'AUD',
        amount: order.totalOverallCostAUD * 100,
        reference: order._id.toString(),
        description: 'Order Id: ' + order._id + ' - Buying from :' + user.displayName,
        successURL: constants.successUrl(order._id),
        failureURL: constants.failUrl(order._id),
    };

    if (bitposUsername && bitposPassword) {
        try {
            let bp = new Bitpos({
                username: bitposUsername,
                password: bitposPassword,
                live: true
            });

            bp.create(body, function(err, response) {
                if (err) {
                    return res.status(400).send({
                        message: err
                    });
                } else {
                    if (response) {
                        self.updateBitposOrder(order, response, req, res, callback);
                    } else {
                        return res.status(400).send({
                            message: 'Error getting a response from Bitpos'
                        });
                    }
                }
            });
        } catch (e) {
            return res.status(400).send({
                message: e
            });
        }
    } else {
        return res.status(400).send({
            message: 'Not authorised'
        });
    }
}

function updateBitposOrder(order, response, req, res, callback) {
    let update = {
        bitposOrderId: response.id,
        bitposEncodedOrderId: response.encodedOrderId,
        bitposMerchantName: response.merchantName,
        bitposDescription: response.description,
        bitposQrCode: response.bitcoinQrCode,
        bitcoin_address: response.bitcoinAddress,
        bitposSatoshiAmount: response.satoshis,
        totalOverallCostBTC: bitcoreFactory.satoshiToBTC(response.satoshis),
        bitposTransactionSpeed: response.transactionSpeed,
        bitposBitcoinUri: response.bitcoinUri,
        bitposReference: response.reference,
        bitposLoadDate: response.loadDate,
        created: Date.now(),
        escrow: false,
        status: 'PENDING',
        orderProceeded: true,
        bitposUsed: true,
        streetAddress: order.streetAddress,
        town: order.town,
        country: order.country,
        postcode: order.postcode,
        telephoneNumber: order.telephoneNumber
    };

    Order.findOneAndUpdate({
        '_id': order._id
    }, update, null, function(err, order) {
        if (err) {
            res.jsonp({
                error: err
            });
        } else {
            // Send new direct order emails to buyer and merchant newDirectPaymentOrder = function(recipient, orderItemsString, orderedFrom, orderId, amount, createdBy)
            let orderItemsString = utilityService.displayOrderItemsLikeString(order.order_items);

            User.findById(order.seller, function(err, seller) {
                // Send email to buyer
                let buyer_merge_vars = emailMerges.newDirectPaymentOrder(req.user.firstName, orderItemsString, seller.username,
                    order._id.toString(), order.totalOverallCostBTC, req.user.username);

                let buyerMailOptions = {
                    user: req.user,
                    recipientEmail: req.user.email,
                    templateName: 'Bitcoin Direct Payment Email (Buyer)',
                    merge_vars: buyer_merge_vars
                };

                sendEmail.sendMandrillEmail(buyerMailOptions);

                // Send email to merchant
                let merchant_merge_vars = emailMerges.newDirectPaymentOrder(seller.firstName, orderItemsString, seller.username,
                    order._id.toString(), order.totalOverallCostBTC, req.user.username);

                let merchantMailOptions = {
                    user: seller.user,
                    recipientEmail: seller.email,
                    templateName: 'Bitcoin Direct Payment Email (Merchant)',
                    merge_vars: merchant_merge_vars
                };

                sendEmail.sendMandrillEmail(merchantMailOptions);
            });

            //Succesfully updated the order, create the order conversation.
            callback(order, req, res, null);
        }
    });
}