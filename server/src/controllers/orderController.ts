import * as mongoose from 'mongoose';
import * as _ from 'lodash';

import helper from './_controllerHelper';
import constants from '../constants/constants';
import emailService from '../services/emailService';
import emailMerges from '../emails/emailMerges';
import orderFactory from '../factory/orderFactory';
import utilities from '../services/utilitiesService';
import orderRepository from '../repositories/orderRepository';
import listingRepository from '../repositories/listingRepository';
import directOrder from '../factory/order-modules/directOrder';
import utilityService from '../services/utilitiesService';
import escrowRepository from '../repositories/escrowRepository';

let escrowStatuses = constants.escrowStatuses;
let Order = mongoose.model('Order');
let Escrow = mongoose.model('Escrow');
let User = mongoose.model('User');

var shippingFactory = require('../factory/shippingFactory'),
    escrowFactory = require('../factory/escrowFactory');

export default {
    createOrder,
    countAllComplete,
    read,
    update,
    deleteOrder,
    orderByID,
    ordersByUserId,
    getOrders,
    sellerOrdersByUserId,
    countSellerCompletedOrders,
    markOrderShipped,
    markOrderNotShipped,
    pendingOrdersByUserId,
    hasAuthorization,
    BitcoinEscrow,
    BitPosOrder,
    createDirectOrder,
    OrderEscrowPaid,
    OrderReleaseEscrowFunds
};

async function createOrder(req, res) {
    try {
        let result = null;
        let orderData = req.body;
        let user = req.user;
        let newOrder = new Order(orderData);
        let quantity = newOrder.order_items[0].quantity;

        newOrder.user = user;
        newOrder.sellerId = orderData.order_items[0].user._id ? orderData.order_items[0].user._id : orderData.order_items[0].user;
        newOrder.seller = newOrder.sellerId;

        let order = await orderRepository.getOrderByUserAndSellerIds(user._id, newOrder.sellerId);

        if (order) {
            let exists = false;

            for (let item of order.order_items) {
                if (newOrder.listingId === item._id) {
                    //Listing is already in the order items so just update the quantity.
                    item.quantity += quantity;

                    result = await saveOrder(order, newOrder.listingId, quantity);

                    exists = true;
                }
            }

            if (!exists) {
                //If the order is not already in the database, we know they have an order with the seller so push it into the order items.
                let newOrderItem = newOrder.order_items[0];

                // add item into order_items list
                order.order_items.push(newOrderItem);

                result = await saveOrder(order, newOrderItem._id, quantity);
            }
        } else {
            // There is no order with the seller, so add a new order and order items collection.
            result = await saveOrder(newOrder, newOrder.listingId, quantity);
        }

        return helper.sendData(result, res);
    } catch (err) {
        return helper.sendFailureMessage(err, res);
    }
}

async function countAllComplete(req, res) {
    try {
        let count = await orderRepository.countAllCompleteOrders();

        helper.sendData({count}, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

//Show the current Order
function read(req, res) {
    res.jsonp(req.order);
}

function update(req, res) {
    var order = req.order;
    order = _.extend(order, req.body);
    order.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: helper.getErrorMessage(err)
            });
        } else {
            res.jsonp(order);
        }
    });
}

async function deleteOrder(req, res) {
    try {
        let order = req.order;
        let orderId = order._id;

        await orderFactory.addListingQuantities(order.order_items);

        await escrowRepository.removeEscrow(order.multisigEscrow);

        await orderRepository.removeOrder(orderId);

        helper.sendData({}, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

function orderByID(req, res, next, id) {
    Order.findById(id)
        .populate('user', 'displayName')
        .populate('seller', 'displayName')
        .populate('conversation')
        .populate('multisigEscrow', '-privateKey -publicKeys -redeemScript -serialised -signed')
        .exec(function(err, order) {
            if (err) return next(err);
            if (!order) return next(new Error('Failed to load Order ' + id));
            if (utilities.checkId(req.user._id, [order.seller._id, order.user._id])) {
                req.order = order;
                next();
            }
        });
}

function ordersByUserId(req, res, next) {
    Order.find({
            'user': req.user._id
        })
        .populate('multisigEscrow', '-privateKey -publicKeys -redeemScript -serialised -signed')
        .sort('-created')
        .populate('user', 'displayName')
        .populate('seller', 'displayName')
        .populate('conversation')
        .exec(function(err, orders) {
            if (err) {
                return res.status(400).send({
                    message: helper.getErrorMessage(err)
                });
            } else {
                var userOrders = [];
                for (var i = 0; i < orders.length; i++) {
                    if (req.user.id === orders[i].user.id) {
                        userOrders.push(orders[i]);
                    }
                }
                res.jsonp(userOrders);
            }
        });
}

async function getOrders(req, res) {
    try {
        let type = req.query.type;
        let userId = req.user._id;

        let orders = await orderRepository.getOrdersByType(type, userId);

        helper.sendData(orders, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

function sellerOrdersByUserId(req, res, next) {
    var query = {
        sellerId: req.user._id
    };
    Order.find(query).sort('-created')
        .populate('user', 'displayName')
        .populate('seller', 'displayName')
        .populate('conversation')
        .populate('multisigEscrow', '-privateKey -publicKeys -redeemScript -serialised -signed')
        .exec(function(err, orders) {
            if (err) {
                return res.status(400).send({
                    message: helper.getErrorMessage(err)
                });
            } else {
                var sellerOrders = [];
                for (var i = 0; i < orders.length; i++) {
                    if (req.user.id === orders[i].sellerId) {
                        sellerOrders.push(orders[i]);
                    }
                }
                res.jsonp(sellerOrders);
            }
        });
}

async function countSellerCompletedOrders(req, res, next, sellerId) {
    try {
        let orderCount = await orderRepository.countSellerCompleteOrders(sellerId);

        helper.sendData({orderCount}, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

function markOrderShipped(req, res, next, id) {
    var query = {
        _id: id
    };
    var update = {
        shippingStatus: 'Shipped'
    };
    Order.findOneAndUpdate(query, update).populate('user', 'email username firstName').exec(function(err, order) {
        if (err) {
            console.log(err);
        } else {

            // mark order as Completed if bitpos only - otherwise order stays at Confirmed Status
            if(order.bitposUsed) {
                order.status = escrowStatuses.co;
                order.save(function(err, order) {
                    if (err) {
                        return err;
                    }
                });
            }
            // Prepare email merge fields
            var orderedFrom = req.user.merchantName ? req.user.merchantName : req.user.username;

            var orderItemsString = utilityService.displayOrderItemsLikeString(order.order_items);

            // Send shipping status email to buyer
            var merge_vars = emailMerges.shippingStatusUpdated(order.user.firstName, order._id, orderedFrom, orderItemsString);
            var mailOptions = {
                user: order.user,
                recipientEmail: order.user.email,
                templateName: 'Shipping status updated (Merchant/Buyer)',
                merge_vars: merge_vars
            };
            emailService.sendMandrillEmail(mailOptions);

            res.jsonp(order);
        }
    });
}

function markOrderNotShipped(req, res, next, id) {
    var query = {
        _id: id
    };
    var update = {
        shippingStatus: 'Not shipped'
    };
    Order.findOneAndUpdate(query, update, null, function(err, order) {
        if (err) {
            console.log(err);
        } else {
            res.jsonp(order);
        }
    });
}

function pendingOrdersByUserId(req, res, next) {
    Order.find({
            user: req.user._id,
            $or: [{
                status: escrowStatuses.p
            }, {
                status: 'PENDING'
            }, {
                status: escrowStatuses.epp
            }]
        }).sort('-created')
        .populate('user')
        .populate('listing')
        .populate('multisigEscrow', '-privateKey -publicKeys -redeemScript -serialised -signed')
        .populate('seller', 'displayName verified subscriptionPlan paymentMethodCreated walletAddress bitposEnabled')
        .exec(function(err, orders) {
            Order.populate(orders, {
                path: 'seller.subscriptionPlan',
                model: 'SubscriptionPlan',
                select: 'planId'
            }, function(err, orders) {
                if (err) {
                    console.log('testing pending orders');
                    return res.status(400).send({
                        message: helper.getErrorMessage(err)
                    });
                } else {
                    shippingFactory.calculateShipping(orders, res);
                }
            });

        });
}

function hasAuthorization(req, res, next) {
    if (req.order.user.id !== req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
}

function BitcoinEscrow(req, res) {
    orderFactory.createBitcoinEscrowOrder(req, res);
}

function BitPosOrder(req, res) {
    orderFactory.createBitPosOrder(req, res);
}

async function createDirectOrder(req, res) {
    try {
        let orderData = req.body;

        if (!orderData.sellerId) throw new Error('No seller id');

        let order = await directOrder.processDirectOrder(orderData, req.user);

        return helper.sendData(order, res);
    } catch (err) {
        return helper.sendFailureMessage(err, res);
    }
}

//Update Escrow Paid for Bitcoin
function OrderEscrowPaid(req, res) {
    escrowFactory.markEscrowPaid(req, res);
}

function OrderReleaseEscrowFunds(req, res, next, id) {
    escrowFactory.releaseEscrowFunds(req, res, id);
}

//helper methods

async function saveOrder(order, listingId, quantity) {
    //let mongo know about the new addition
    order.markModified('order_items');

    let listing = await listingRepository.minusListingQuantity(listingId, quantity);

    let result = await orderRepository.saveOrderWithListing(order, listing);

    return result;
}
