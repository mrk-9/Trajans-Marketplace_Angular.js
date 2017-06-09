import * as _ from 'lodash';

import bitcoreFactory from '../bitcoreFactory';
import emailMerges from '../../emails/emailMerges';
import emailService from '../../services/emailService';
import directOrderHelper from '../order-modules/helpers';
import constants from '../../constants/constants';
import orderRepository from '../../repositories/orderRepository';
import escrowRepository from '../../repositories/escrowRepository';
import assetsRepository from '../../repositories/assetsRepository';
import subscriptionPlanRepository from '../../repositories/subscriptionPlanRepository';
import userRepository from '../../repositories/userRepository';
import utilityService from '../../services/utilitiesService';

export default {
    processDirectOrder
};

async function processDirectOrder(orderData, user) {
    let result = null;

    let order = await orderRepository.updateDirectOrder(orderData);

    // order already has escrow therefore old order
    if (order.multisigEscrow) {
        await escrowRepository.updateOrderSimpleEscrow(order);

        result = await orderRepository.getOrderWithEscrow(order._id);
    } else {
        // order does not yet have an escrow created, therefore is new order
        let escrow = await createOrderSimpleEscrow(order, user);

        result = await directOrderHelper.createDefaultOrderConversationAsync(order, escrow, user);
    }

    return result;
}

async function createOrderSimpleEscrow(order, user) {
    let keyHash = await assetsRepository.getPrivateKeyHash();

    if (!order.seller.subscriptionPlan) throw new Error('No subscription plan id.');

    let subscriptionPlan = await subscriptionPlanRepository.getSubscriptionPlanById(order.seller.subscriptionPlan);

    if (!subscriptionPlan) throw new Error('Could not find a subscription plan to assign our fee percentage to final total');

    let ourFeeBTC = '';
    let ourFeeFiat = '';

    if (subscriptionPlan.group === 'Business Plus') {
        ourFeeBTC = (order.bitcoin_amount * constants.ourFees.businessplus).toFixed(8);
        ourFeeFiat = (order.totalOverallCostAUD * constants.ourFees.businessplus).toFixed(2);
    } else {
        ourFeeBTC = (order.bitcoin_amount * constants.ourFees.business).toFixed(8);
        ourFeeFiat = (order.totalOverallCostAUD * constants.ourFees.business).toFixed(8);
    }

    let address = bitcoreFactory.generateAddress();

    let privateKey =  bitcoreFactory.encryptPrivateKey(address.privateKey, keyHash);

    let escrow = await escrowRepository.createNewEscrow(order, user, ourFeeBTC, ourFeeFiat, address, privateKey);

    // Send new direct order emails to buyer and merchant
    let orderItemsString = utilityService.displayOrderItemsLikeString(order.order_items);

    let seller = await userRepository.getUserById(order.sellerId);

    sendEmailToBuyer(user, orderItemsString, seller, order._id, escrow.amount);

    sendEmailToMerchant(user, orderItemsString, seller, order._id, escrow.amount);

    return escrow;
}

//helper methods

function sendEmailToBuyer(user, orderItemsString, seller, orderId, escrowAmount) {
    let buyerMergeVars = emailMerges.newDirectPaymentOrder(user.firstName, orderItemsString,
        seller.username, orderId.toString(), escrowAmount, user.username);

    let buyerMailOptions = {
        user: user,
        recipientEmail: user.email,
        templateName: 'Bitcoin Direct Payment Email (Buyer)',
        merge_vars: buyerMergeVars
    };

    emailService.sendMandrillEmail(buyerMailOptions);
}

function sendEmailToMerchant(user, orderItemsString, seller, orderId, escrowAmount) {
    let merchantMergeVars = emailMerges.newDirectPaymentOrder(seller.firstName, orderItemsString,
        seller.username, orderId.toString(), escrowAmount, user.username);

    let merchantMailOptions = {
        user: seller.user,
        recipientEmail: seller.email,
        templateName: 'Bitcoin Direct Payment Email (Merchant)',
        merge_vars: merchantMergeVars
    };

    emailService.sendMandrillEmail(merchantMailOptions);
}