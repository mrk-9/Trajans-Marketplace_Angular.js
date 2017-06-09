import * as mongoose from 'mongoose';
import * as _ from 'lodash';

import constants from '../../constants/constants';
import bitcoreFactory from '../bitcoreFactory';
import escrowAuditFactory from '../escrowAuditFactory';
import emailMerges from '../../emails/emailMerges';
import sendEmail from '../../services/emailService';
import utilityService from '../../services/utilitiesService';

let Order = mongoose.model('Order');
let User = mongoose.model('User');
let Escrow = mongoose.model('Escrow');

export default {
    updateBitcoinOrder
};

function updateBitcoinOrder(order, order_items, orderId, req, res, callback) {
    let newTotalAUD = 0;

    // Calculate new total overall cost AUD/BTC
    order_items.forEach(function(item){
        newTotalAUD += item.priceFiat.toFixed(2);
    });

    let update = {
        escrow: true,
        currency: 'BTC',
        merchant_reference: orderId,
        merchant_invoice: orderId,
        totalOverallCostAUD: order.newTotalOverallCostAUD ? order.newTotalOverallCostAUD : order.totalOverallCostAUD,
        bitcoin_amount: order.newTotalOverallCostBTC ? order.newTotalOverallCostBTC : order.totalOverallCostBTC,
        orderProceeded: true,
        status: 'UNPAID',
        streetAddress: order.streetAddress,
        town: order.town,
        country: order.country,
        postcode: order.postcode,
        telephoneNumber: order.telephoneNumber,
        order_items: order_items,
        userEmail: order.userEmail || '',
        changeAddress: order.changeAddress || ''
    };

    Order.findOneAndUpdate({
        '_id': orderId
    }, update, null).populate('seller', '-password -salt').exec(function(err, order) {
        if (err) {
            return err;
        }
        if (order.multisigEscrow) {
            updateOrderEscrow(order, req, res, callback);
        } else {
            createOrderEscrow(order, req, res, callback);
        }
    });
}

function updateOrderEscrow(order, req, res, callback) {
    Escrow.findById(order.multisigEscrow, function(err, escrow) {
        escrow.status = 'UNPAID';
        escrow.amount = parseFloat(order.bitcoin_amount).toFixed(8);

        escrow.save();

        Order.findOne({
            '_id': order._id
        }).populate('multisigEscrow', '-privateKey -publicKeys -redeemScript -serialised -signed').exec(function(err, order) {
            if (err) {
                return err;
            }
            res.jsonp(order);
        });
    });
}

function createOrderEscrow(order, req, res, callback) {
    let change;

    // Change address...
    if (order.changeAddress) {
        change = order.changeAddress;
    } else if (req.user.walletAddress) {
        change = req.user.walletAddress;
    } else {
        change = constants.feeAddress;
    }

    //Create escrow;
    let multisigAddress = bitcoreFactory.generateMultisigAddress();
    let encryptionPassword = bitcoreFactory.createEncryptionPassword();
    let encryptedPrivateKey = bitcoreFactory.encryptPrivateKey(multisigAddress.privateKeys[0], encryptionPassword);

    let newEscrow = new Escrow({
        order: order,
        buyer: req.user,
        seller: order.seller,
        amount: parseFloat(order.bitcoin_amount).toFixed(8),
        privateKey: encryptedPrivateKey,
        publicKeys: multisigAddress.publicKeys,
        escrowAddress: multisigAddress.multiSigAddress,
        redeemScript: multisigAddress.redeemScript,
        change: change,
        recipientAddress: order.seller.walletAddress
    });

    newEscrow.escrowAudits.push(escrowAuditFactory.createEscrowAudit('Escrow Created', req.user));

    newEscrow.save(function(err, escrow) {
        if (err) {
            console.log(err);
            return err;
        }

        // Email the private keys here....
        let orderItemsString = utilityService.displayOrderItemsLikeString(order.order_items);

        // Get the merchant for this order
        User.findById(order.seller, function(err, seller) {
            // Send email to potential buyer with key etc
            let buyerMergeVars = emailMerges.newModeratedPaymentOrder(req.user.firstName, order._id.toString(), orderItemsString,
                multisigAddress.privateKeys[1], escrow.amount, multisigAddress.multiSigAddress, req.user.username,
                order.seller.username, encryptionPassword, escrow._id);

            let mailOptions = {
                user: req.user,
                recipientEmail: order.userEmail ? order.userEmail : req.user.email,
                templateName: 'New Order - Moderated Payment',
                merge_vars: buyerMergeVars,
                text: false,
                pgpKey: req.user.pgpKey ? req.user.pgpKey : null
            };

            sendEmail.sendMandrillEmail(mailOptions);

            // Send email to seller with key etc
            let sellerMergeVars = emailMerges.newModeratedPaymentOrder(seller.firstName, order._id.toString(),
                orderItemsString, multisigAddress.privateKeys[2], escrow.amount, multisigAddress.multiSigAddress,
                req.user.username, order.seller.username, encryptionPassword, escrow._id);

            let mailOptionsSeller = {
                user: seller.email,
                recipientEmail: seller.email,
                templateName: 'New Order - Moderated Payment',
                merge_vars: sellerMergeVars,
                text: false,
                pgpKey: seller.pgpKey ? seller.pgpKey : null
            };

            sendEmail.sendMandrillEmail(mailOptionsSeller);
        });

        callback(order, req, res, escrow);
    });
}