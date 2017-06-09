import * as mongoose from 'mongoose';
import * as _ from 'lodash';

import textRepository from '../../repositories/textRepository';
import conversationRepository from '../../repositories/conversationRepository';
import orderRepository from '../../repositories/orderRepository';

let User = mongoose.model('User');
let Order = mongoose.model('Order');
let Conversation = mongoose.model('Conversation');
let Text = mongoose.model('Text');

export default {
    checkAllHaveBeenReviewed,
    updateUserInformation,
    createDefaultOrderConversation,
    createDefaultOrderConversationAsync,
    createOrderItems
};

function checkAllHaveBeenReviewed(order) {
    let completed: boolean;

    for (let i = 0; i < order.order_items.length; i++) {
        if (!order.order_items[i].reviewed) {
            completed = false;
            break;
        } else {
            completed = true;
        }
    }

    return completed;
}

function updateUserInformation(order, user) {
    let update = {
        streetAddress: order.streetAddress,
        town: order.town,
        country: order.country,
        city: order.city,
        postcode: order.postcode,
        telephoneNumber: order.telephoneNumber,
        buyerEmail: user.email
    };

    User.findOneAndUpdate({
        _id: user._id
    }, update, function(err, res) {
        if (err)
            return err;
    });
}

//NOTE : Allways call this method after an order is created, so that a default conversation is created for the order.
//TODO remove use createDefaultOrderConversationAsync instead
function createDefaultOrderConversation(order, req, res, escrow) {
    //Create default message for convsersation 
    let message = new Text();
    message.to = req.user;
    message.from = order.seller;
    message.message = 'Thank you for ordering from my store!  If you have any questions you can ask them here.';

    message.save();

    // Create default conversation for order
    let conversation = new Conversation();
    conversation.to = req.user;
    conversation.from = order.seller;
    conversation.subject = 'New Order';
    conversation.messages.push(message);
    conversation.type = 'order';

    conversation.save();

    // Save order escrow if there is one.
    if (escrow) {
        order.multisigEscrow = escrow;
    }

    order.conversation = conversation;

    order.save(function(err, order) {
        if (err) return err;

        Order.findOne({
            '_id': order._id
        }).populate('multisigEscrow', '-privateKey -publicKeys -redeemScript -serialised -signed')
            .exec(function(err, order) {
                if (err) {
                    return err;
                }
                res.jsonp(order);
            });
    });
}

async function createDefaultOrderConversationAsync(orderData, escrow, user) {
    //Create default message for conversation
    let message = 'Thank you for ordering from my store! If you have any questions you can ask them here.';

    let text = await textRepository.createText(user, orderData.seller, message);

    // Create default conversation for order
    let conversation = await conversationRepository.createConversation(user, orderData.seller, 'New Order', 'order', text);

    // Save order escrow if there is one.
    if (escrow) {
        orderData.multisigEscrow = escrow;
    }

    let order = await orderRepository.saveOrderWithConversation(orderData, conversation);

    return await orderRepository.getOrderWithMultisigEscrow(order._id);
}

function createOrderItems(orderItems, order) {
    let generatedOrderItems = [];

    _.forEach(orderItems, function(orderItem) {
        orderItem._id = order.listingId;
        generatedOrderItems.push(orderItem);
    });

    return generatedOrderItems;
}