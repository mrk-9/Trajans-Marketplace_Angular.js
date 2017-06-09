import * as mongoose from 'mongoose';

import constants from '../constants/constants';

let escrowStatuses = constants.escrowStatuses;
let Order = mongoose.model('Order');

export default {
    getOrderById,
    getOrderByUserAndSellerIds,
    saveOrderWithListing,
    updateDirectOrder,
    getOrderWithEscrow,
    saveOrderWithConversation,
    getOrderWithMultisigEscrow,
    countAllCompleteOrders,
    countSellerCompleteOrders,
    removeOrder,
    markOrderItemAsReviewed,
    getOrdersByType
};

const PENDING_STATUS = 'PENDING';
const CURRENCY = 'BTC';

async function getOrderById(id) {
    return await Order.findById(id);
}

async function getOrderByUserAndSellerIds(userId, sellerId) {
    let query = {
        user: userId,
        $or: [
            {status: escrowStatuses.p},
            {status: PENDING_STATUS}
        ],
        sellerId: sellerId
    };

    return await Order.findOne(query).sort('-created');
}

async function saveOrderWithListing(order, listing) {
    order.orderProceeded = false;
    order.listing = listing;

    return await order.save();
}

async function updateDirectOrder(order) {
    let orderId = order._id;

    let newOrder = {
        escrow: false,
        escrowSimple: true,
        currency: CURRENCY,
        merchant_reference: orderId,
        merchant_invoice: orderId,
        totalOverallCostAUD: order.newTotalOverallCostAUD ? order.newTotalOverallCostAUD : order.totalOverallCostAUD,
        bitcoin_amount: order.newTotalOverallCostBTC ? order.newTotalOverallCostBTC : order.totalOverallCostBTC,
        orderProceeded: true,
        status: escrowStatuses.p,
        streetAddress: order.streetAddress,
        town: order.town,
        country: order.country,
        postcode: order.postcode,
        telephoneNumber: order.telephoneNumber,
        order_items: order.order_items
    };

    return await Order.findByIdAndUpdate(orderId, {$set: newOrder}, {new: true}).populate('seller', '-password -salt');
}

async function getOrderWithEscrow(id) {
    return await Order.findById(id).populate('multisigEscrow', '-privateKey');
}

async function saveOrderWithConversation(order, conversation) {
    order.conversation = conversation;

    return await order.save();
}

async function getOrderWithMultisigEscrow(id) {
    return await Order.findById(id).populate('multisigEscrow', '-privateKey -publicKeys -redeemScript -serialised -signed');
}

async function countAllCompleteOrders() {
    let query = {
        status: escrowStatuses.co
    };

    return await Order.where(query).count();
}

async function countSellerCompleteOrders(sellerId) {
    let query = {
        sellerId: sellerId,
        status: escrowStatuses.co
    };

    return await Order.where(query).count();
}

async function removeOrder(id) {
    return await Order.remove({_id: id});
}

async function markOrderItemAsReviewed(id) {
    let update = {
        reviewCompleted: true
    };

    return await Order.findByIdAndUpdate(id, {$set: update});
}

async function getOrdersByType(type, userId) {
    let query: any = {};

    if (type === 'Selling') {
        query = {
            seller: userId
        };
    } else {
        query = {
            user: userId
        };
    }

    return await Order.find(query)
        .populate('multisigEscrow', '-privateKey -publicKeys -redeemScript -serialised -signed')
        .populate('listingId')
        .populate('listing')
        .populate('seller', 'displayName')
        .populate('user', 'displayName')
        .populate('conversation')
        .sort('-created')
        .then((orders) => {
            return Order.populate(orders, {
                path: 'conversation.messages',
                model: 'Text'
            });
        })
        .then((orders) => {
            return Order.populate(orders, [{
                path: 'conversation.messages.from',
                model: 'User',
                select: 'displayName'
            }, {
                path: 'conversation.messages.to',
                model: 'User',
                select: 'displayName'
            }]);
        })
}