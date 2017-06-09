import * as mongoose from 'mongoose';

import bitposOrder from './order-modules/bitposOrder';
import multisigOrder from './order-modules/multisigOrder';
import helpers from './order-modules/helpers';
import listingRepository from '../repositories/listingRepository';

let Order = mongoose.model('Order');
let User = mongoose.model('User');

export default {
    addListingQuantities,
    createBitcoinEscrowOrder,
    createBitPosOrder
};

async function addListingQuantities(items) {
    for (let item of items) {
        await listingRepository.increaseListingQuantity(item._id, item.quantity);
    }
}

//MULTIGIS ORDER
function createBitcoinEscrowOrder(req, res) {
    let order = req.body;
    //helpers.updateUserInformation(order, req.user);
    let order_items = helpers.createOrderItems(order.order_items, order);

    multisigOrder.updateBitcoinOrder(order, order_items, order._id, req, res, helpers.createDefaultOrderConversation);
}

// BITPOS ORDER
function createBitPosOrder(req, res) {
    let order = req.body;
    //helpers.updateUserInformation(order, req.user);
    let sellerId = req.body.sellerId;

    if (sellerId) {
        User.findOne({
            _id: sellerId
        }, function(err, user) {
            bitposOrder.processBitPos(order, user, req, res, helpers.createDefaultOrderConversation);
        });
    } else {
        return res.status(400).send({
            message: 'No seller Id'
        });
    }
}

function checkAllHaveBeenReviewed(order) {
    return helpers.checkAllHaveBeenReviewed(order);
}
