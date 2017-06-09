import * as mongoose from 'mongoose';

import constants from '../constants/constants';
import escrowService from '../services/escrowService';
import emailMerges from '../emails/emailMerges';
import sendEmail from '../services/emailService';
import bitcoreFactory from '../factory/bitcoreFactory';
import escrowAuditFactory from '../factory/escrowAuditFactory';
import orderFactory from '../factory/orderFactory';
import utilities from '../services/utilitiesService';
import helper from './_controllerHelper';
import escrowRepository from '../repositories/escrowRepository';
import orderRepository from '../repositories/orderRepository';

let escrowStatuses = constants.escrowStatuses;

var Escrow = mongoose.model('Escrow'),
    User = mongoose.model('User'),
    Order = mongoose.model('Order'),
    bitcore = require('bitcore');

export default {
    escrowById,
    getEscrows,
    cancelEscrow,
    getBalance,
    signEscrow,
    signAndBroadcast,
    requestRefund,
    confirmRefund,
    cancelRefund,
    buyerRecieved,
    sellerRecieved,
    countEscrows
}

function escrowById(req, res) {
    var self = this;
    var id = req.query.id;
    Escrow.findById(id)
        .populate('seller', 'displayName email')
        .populate('order')
        .populate('buyer', 'displayName email')
        .populate('escrowAudits')
        .select('-privateKey -publicKeys -redeemScript -serialised -signed')
        .exec(function(err, escrow) {
            if (err) {
                res.jsonp({
                    success: false,
                    errors: 'Error Getting Escrow',
                    data: null
                });
            } else {
                if (escrow) {
                    res.jsonp({
                        success: true,
                        errors: null,
                        data: escrow
                    });
                } else {
                    res.jsonp({
                        success: true,
                        errors: null,
                        data: escrow
                    });
                }
            }
        });
}

function getEscrows(req, res) {
    Escrow.find({
            $or: [{
                'buyer': req.user._id.toString()
            }, {
                'seller': req.user._id.toString()
            }]
        }, {
            privateKey: 0,
            publicKeys: 0,
            redeemScript: 0,
        }).populate('seller', 'displayName email').populate('buyer', 'displayName email').populate('order').sort({
            'created': -1
        })
        .populate('escrowAudits')
        .exec(function(err, escrows) {
            if (err) {
                res.jsonp({
                    success: false,
                    errors: 'Error Getting Escrows',
                    data: null
                });
            } else {
                res.jsonp({
                    success: true,
                    errors: null,
                    data: escrows
                });
            }
        });
}

async function cancelEscrow(req, res) {
    try {
        let data = {};
        let user = req.user;
        let escrowId = req.body.id;
        let orderId = req.body.orderId;

        if (!user || !escrowId) {
            data = {
                success: false,
                errors: 'Error cancelling escrow...',
                data: null
            };

            helper.sendData(data, res);
        }

        let escrow = await escrowRepository.getEscrowById(escrowId);

        if (!escrow) {
            data = {
                success: false,
                errors: 'Error Not Found',
                data: null
            };

            helper.sendData(data, res);
        }

        let passed = utilities.checkId(user._id, [escrow.seller, escrow.buyer]);

        if (!passed) {
            data = {
                success: false,
                errors: 'Not authorised',
                data: null
            };

            helper.sendData(data, res);
        }

        if (escrow.status !== 'UNPAID') {
            data = {
                success: false,
                errors: 'Only unpaid escrows can be cancelled...',
                data: null
            };

            helper.sendData(data, res);
        }

        await escrowRepository.removeEscrow(escrow._id);

        if (orderId) {
            let order = await orderRepository.getOrderById(orderId);

            if (!order) throw new Error('Cannot find order by Id');

            await orderFactory.addListingQuantities(order.order_items);

            await orderRepository.removeOrder(orderId);
        }

        data = {
            success: true,
            errors: null,
            data: true
        };

        helper.sendData(data, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

function getBalance(req, res) {
    var escrowId = req.query.escrowId;
    if (escrowId) {
        Escrow.findById(escrowId.toString())
            .populate('order')
            .exec(function(err, escrow) {
                if (err) {
                    res.jsonp({
                        success: false,
                        errors: 'Error finding escrow...',
                        data: null
                    });
                } else {
                    if (utilities.checkId(req.user._id, [escrow.seller, escrow.buyer])) {
                        if (escrow.escrowAddress) {
                            var result = bitcoreFactory.getEscrowBalance(escrow.escrowAddress, balanceCallback, escrow, res, req);
                        } else {
                            res.jsonp({
                                error: 'No address'
                            });
                        }
                    } else {
                        res.jsonp({
                            success: false,
                            errors: 'Not authorised',
                            data: null
                        });
                    }
                }
            });
    } else {
        res.jsonp({
            success: false,
            errors: 'Error finding escrow...',
            data: null
        });
    }

}

function signEscrow(req, res) {
    var escrowId = req.body.id;
    var privateKey = req.body.key;
    if (escrowId && privateKey) {
        if (bitcoreFactory.validatePrivateKey(privateKey)) {
            Escrow.findById(escrowId, function(err, escrow) {
                if (err) return err;
                if (utilities.checkId(req.user._id, [escrow.seller, escrow.buyer])) {
                    if (!err && escrow.status === escrowStatuses.ep) {
                        escrow.signed = privateKey;
                        escrow.status = escrowStatuses.swok;
                        escrow.escrowAudits.push(escrowAuditFactory.createEscrowAudit('Escrow Signed', req.user));
                        escrow.save(function() {
                            res.jsonp({
                                success: true,
                                errors: null,
                                status: escrow.status
                            });
                        });
                    } else {
                        res.jsonp({
                            success: false,
                            errors: 'Escrow not found or in wrong status',
                            data: null
                        });
                    }
                } else {
                    res.jsonp({
                        success: false,
                        errors: 'Not authorised',
                        data: null
                    });
                }

            });
        } else {
            res.jsonp({
                success: false,
                errors: 'Error signing escrow, invalid private key...',
                data: null
            });
        }
    } else {
        res.jsonp({
            success: false,
            errors: 'Error signing escrow, need id and key...',
            data: null
        });
    }

}

function signAndBroadcast(req, res) {
    var escrowId = req.body.id;
    var privateKey = req.body.key;
    if (escrowId && privateKey && bitcoreFactory.validatePrivateKey(privateKey)) {
        try {
            Escrow.findById(escrowId, function(err, escrow) {
                if (utilities.checkId(req.user._id, [escrow.seller, escrow.buyer])) {
                    bitcoreFactory.getUnspent(escrow.escrowAddress, broadcastTransaction, escrow, privateKey, res, req);
                } else {
                    res.jsonp({
                        success: false,
                        errors: 'Not authorised',
                        data: null
                    });
                }
            });
        } catch (e) {
            res.jsonp({
                errors: 'Error broadcasting the transaction',
                success: false,
                data: null
            });
        }
    } else {
        res.jsonp({
            errors: 'Error broadcasting the transaction, need id and key...',
            success: false,
            data: null
        });
    }
}

function requestRefund(req, res) {
    var refundAddress = req.body.refundAddress;
    var refundReason = req.body.refundReason;
    var escrowId = req.body.escrowId;
    if (!bitcoreFactory.validateAddress(refundAddress) || !refundReason) {
        res.jsonp({
            errors: 'Refund address not valid. Or no reason for refund was given...',
            success: false,
            data: null
        });
    } else {
        Escrow.findById(escrowId).populate('order').exec(function(err, escrow) {
            if (err) return (err);
            if (utilities.checkId(req.user._id, [escrow.seller, escrow.buyer])) {
                if (escrow.status === escrowStatuses.swok || escrow.status === escrowStatuses.ep) {
                    escrow.refundAddress = refundAddress;
                    escrow.refundReason = refundReason;
                    escrow.refundRequested = true;
                    escrow.status = escrowStatuses.rr;
                    escrow.escrowAudits.push(escrowAuditFactory.createEscrowAudit('Escrow Refund Requested', req.user));
                    escrow.save(function(err, escrow) {
                        if (err) {
                            res.jsonp({
                                success: false,
                                errors: 'Error updating escrow',
                                data: null
                            });
                        } else {
                            if (escrow.order) {
                                updateOrderStatus(escrow.order._id, escrowStatuses.rr);
                            }
                            User.findById(escrow.seller, function(err, seller) {
                                var merge = emailMerges.refundRequested(seller.firstName, escrow.order._id);
                                var mailOptions = {
                                    user: req.user,
                                    recipientEmail: seller.email,
                                    templateName: 'Order Refund Requested',
                                    merge_vars: merge,
                                    text: false
                                };
                                sendEmail.sendMandrillEmail(mailOptions);
                            });
                            res.jsonp({
                                success: true,
                                errors: null,
                                data: null
                            });
                        }
                    });
                } else {
                    res.jsonp({
                        success: false,
                        errors: 'Not in correct status authorised, escrow must be signed with one key or paid.',
                        data: null
                    });
                }
            } else {
                res.jsonp({
                    success: false,
                    errors: 'Not authorised',
                    data: null
                });
            }

        });
    }
}

function confirmRefund(req, res) {
    var escrowId = req.body.escrowId;
    Escrow.findById(escrowId, {
        privateKey: 0,
        publicKeys: 0,
        redeemScript: 0,
    }).populate('order').exec(function(err, escrow) {
        if (utilities.checkId(req.user._id, [escrow.seller, escrow.buyer])) {
            if (escrow.status === escrowStatuses.rr) {
                escrow.status = escrowStatuses.ra;
                escrow.recipientAddress = escrow.refundAddress;
                escrow.refundRequested = false;
                escrow.escrowAudits.push(escrowAuditFactory.createEscrowAudit('Escrow Refund Approved', req.user));
                escrow.save(function(err, escrow) {
                    if (err) {
                        res.jsonp({
                            success: false,
                            errors: 'Error updating escrow',
                            data: null
                        });
                    } else {
                        if (escrow.order) {
                            updateOrderStatus(escrow.order._id, escrowStatuses.ra);
                        }
                        User.findById(escrow.buyer, function(err, buyer) {
                            var merge = emailMerges.refundRequested(buyer.firstName, escrow.order._id, escrow.buyer.username, 'trajans.market');
                            var mailOptions = {
                                user: buyer,
                                recipientEmail: buyer.email,
                                templateName: 'Order Refund Approved',
                                merge_vars: merge,
                                text: false
                            };
                            sendEmail.sendMandrillEmail(mailOptions);
                        });
                        res.jsonp({
                            success: true,
                            errors: null,
                            data: escrow
                        });
                    }
                });
            } else {
                res.jsonp({
                    success: false,
                    errors: 'Escrow not in correct status, must be Refund Requested',
                    data: null
                });
            }
        } else {
            res.jsonp({
                success: false,
                errors: 'Not authorised',
                data: null
            });
        }
    });
}

function cancelRefund(req, res) {
    var escrowId = req.body.escrowId;
    Escrow.findById(escrowId, {
        privateKey: 0,
        publicKeys: 0,
        redeemScript: 0,
    }).populate('order').exec(function(err, escrow) {
        if (utilities.checkId(req.user._id, [escrow.seller, escrow.buyer])) {
            if (escrow.status === escrowStatuses.rr) {
                escrow.status = escrowStatuses.rc;
                escrow.refundRequested = false;
                escrow.refundReason = '';
                escrow.signed = '';
                escrow.refundAddress = null;
                escrow.escrowAudits.push(escrowAuditFactory.createEscrowAudit('Escrow Refund Declined', req.user));
                escrow.save(function(err, escrow) {
                    if (err) {
                        res.jsonp({
                            success: false,
                            errors: 'Error updating escrow',
                            data: null
                        });
                    } else {
                        if (escrow.order) {
                            updateOrderStatus(escrow.order._id, escrowStatuses.rc);
                        }

                        User.findById(escrow.buyer, function(err, buyer) {
                            var merge = emailMerges.escrowId(buyer.firstName, escrow.order._id);
                            var mailOptions = {
                                user: buyer,
                                recipientEmail: buyer.email,
                                templateName: 'Order Refund Declined',
                                merge_vars: merge,
                                text: false
                            };
                            sendEmail.sendMandrillEmail(mailOptions);
                        });
                        res.jsonp({
                            success: true,
                            errors: null,
                            data: true
                        });
                    }
                });
            } else {
                res.jsonp({
                    success: false,
                    errors: 'Escrow not in correct status, must be Refund Requested',
                    data: null
                });
            }
        } else {
            res.jsonp({
                success: false,
                errors: 'Not authorised',
                data: null
            });
        }

    });
}

function buyerRecieved(req, res) {
    var recieved = req.body.recieved;
    var escrowId = req.body.id;
    Escrow.findById(escrowId).populate('order').exec(function(err, escrow) {
        if (utilities.checkId(req.user._id, [escrow.seller, escrow.buyer])) {
            if (err) return err;
            if (escrow) {
                escrow.buyerRecieved = recieved;
                escrow.escrowAudits.push(escrowAuditFactory.createEscrowAudit('Recieved their private key', req.user));
                escrow.save(function(err, escrow) {
                    res.jsonp({
                        success: true,
                        errors: null,
                        data: recieved
                    });
                });
            } else {
                res.jsonp({
                    success: false,
                    errors: 'Failed to set value',
                    data: null
                });
            }
        } else {
            res.jsonp({
                success: false,
                errors: 'Not authorised',
                data: null
            });
        }

    });
}

function sellerRecieved(req, res) {
    var recieved = req.body.recieved;
    var escrowId = req.body.id;
    Escrow.findById(escrowId).populate('order').exec(function(err, escrow) {
        if (err) return err;
        if (utilities.checkId(req.user._id, [escrow.seller, escrow.buyer])) {
            if (escrow) {
                escrow.sellerRecieved = recieved;
                escrow.escrowAudits.push(escrowAuditFactory.createEscrowAudit('Recieved their private key', req.user));
                escrow.save(function() {
                    res.jsonp({
                        success: true,
                        errors: null,
                        data: recieved
                    });
                });
            } else {
                res.jsonp({
                    success: false,
                    errors: 'Failed to set value',
                    data: null
                });
            }
        } else {
            res.jsonp({
                success: false,
                errors: 'Not authorised',
                data: null
            });
        }

    });
}

function countEscrows(req, res) {
    Escrow.aggregate({
            $match: {
                $or: [{
                    'buyer': req.user._id,

                }, {
                    'seller': req.user._id
                }]
            }
        }, {
            $project: {
                status: 1
            }
        }, {
            $group: {
                _id: '$status',
                count: {
                    $sum: 1
                }
            }
        },
        function(err, result) {
            if (err) return (err);
            res.jsonp(result);
        }
    );
}

//helper methods

function updateOrderStatus(orderId, status) {
    Order.findById(orderId, function(err, order) {
        if (err) {
            return err;
        } else {
            order.status = status;
            order.save(function(err, order) {
                if (err) {
                    return err;
                }
            });
        }
    });
}

function balanceCallback(req, res, address, escrow) {
    var escrowStatus = escrowService.escrowStatus(escrow.amount, address.balance);
    escrow.status = escrowStatus.status;
    escrow.balance = escrowStatus.balance;
    if (escrow.status === 'ESCROW PAID') {
        escrow.escrowAudits.push(escrowAuditFactory.createEscrowAudit('Escrow Paid', req.user));
    }
    Order.findById(escrow.order._id, function(err, order) {
        if (order.escrowSimple) {
            if (escrow.status === 'ESCROW PAID') {
                escrow.escrowAudits.push(escrowAuditFactory.createEscrowAudit('Payment Received', req.user));
                escrow.status = 'PAYMENT RECEIVED';
                order.status = 'PAYMENT RECEIVED';
                order.save();
                escrow.save();
                res.jsonp({
                    success: true,
                    errors: null,
                    data: address,
                    balance: escrowStatus.balance,
                    status: escrow.status
                });
            }
        } else {
            order.status = escrowStatus.status;
            order.save();
            escrow.save(function(err, escrow) {
                if (escrow.status === 'ESCROW PAID') {
                    var orderId = escrow.order._id.toString();
                    User.findById(escrow.seller, function(err, seller) {
                        User.findById(escrow.buyer, function(err, buyer) {
                            var mergeBuyer = emailMerges.newModeratedPaymentInEscrow(buyer.firstName, escrow.amount, orderId, escrow.escrowAddress, buyer.username, seller.username, escrow._id.toString());
                            var mergeSeller = emailMerges.newModeratedPaymentInEscrow(seller.firstName, escrow.amount, orderId, escrow.escrowAddress, buyer.username, seller.username, escrow._id.toString());

                            var mailOptionsBuyer = {
                                user: buyer,
                                recipientEmail: buyer.email,
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
                    });
                }
                res.jsonp({
                    success: true,
                    errors: null,
                    data: address,
                    balance: escrowStatus.balance,
                    status: escrow.status
                });
            });
        }

    });

}

function broadcastCallback(escrow, txid, req, res) {
    if (escrow && txid) {
        escrow.txid = txid;
        escrow.status = escrowStatuses.co;
        escrow.escrowAudits.push(escrowAuditFactory.createEscrowAudit('Escrow Signed and Released', req.user));
        escrow.save(function(err, escrow) {
            if (err) {
                res.jsonp({
                    success: false,
                    errors: 'Broadcast transaction failed, try again later',
                    data: null
                });
            } else {
                Escrow.findById(escrow._id).populate('order').exec(function(err, escrow) {
                    if (err) return err;

                    User.findById(escrow.seller, function(err, seller) {
                        // Send email to potential buyer with key etc
                        //exports.newModeratedPaymentReleased = function(recipient, orderId, address, amount, createdBy, orderedFrom, escrowId) {
                        if (seller) {
                            var buyerMergeVars = emailMerges.newModeratedPaymentReleased(req.user.firstName, escrow.order._id.toString(), escrow.escrowAddress, escrow.amount, req.user.username, seller.username, escrow._id);
                            var mailOptions = {
                                user: req.user,
                                recipientEmail: req.user.email,
                                templateName: 'Moderated Payment - Released',
                                merge_vars: buyerMergeVars,
                                text: false,
                                pgpKey: req.user.pgpKey ? req.user.pgpKey : null
                            };
                            sendEmail.sendMandrillEmail(mailOptions);

                            // Send email to seller with key etc
                            var sellerMergeVars = emailMerges.newModeratedPaymentReleased(seller.firstName, escrow.order._id.toString(), escrow.escrowAddress, escrow.amount, req.user.username, seller.username, escrow._id);
                            var mailOptionsSeller = {
                                user: seller.email,
                                recipientEmail: seller.email,
                                templateName: 'Moderated Payment - Released',
                                merge_vars: sellerMergeVars,
                                text: false,
                                pgpKey: seller.pgpKey ? seller.pgpKey : null
                            };
                            sendEmail.sendMandrillEmail(mailOptionsSeller);
                        } else {
                            res.jsonp({
                                success: false,
                                errors: 'Could not find the seller',
                                data: null
                            });
                        }
                    });

                    if (escrow.order) {
                        Order.findByIdAndUpdate(escrow.order, {
                            status: 'COMPLETE'
                        }, function(err, done) {
                            res.jsonp({
                                status: escrow.status,
                                txid: txid,
                                errors: null,
                                success: true
                            });
                        });
                    } else {
                        res.jsonp({
                            status: escrow.status,
                            txid: txid,
                            errors: null,
                            success: true
                        });
                    }
                });
            }
        });
    } else {
        res.jsonp({
            success: false,
            errors: 'Broadcast transaction failed, is the escrow paid?',
            data: null
        });
    }

}

function broadcastTransaction(req, res, utxos, escrow, privateKey) {
    // Check escrow has reffered buyer
    User.findById(escrow.buyer, function(err, buyer) {
        if (escrow.status === escrowStatuses.swok && escrow.signed) {
            var change = bitcore.Address.fromString(escrow.change);
            var utxo = utxos.map(function(utx) {
                return bitcoreFactory.generateUtxo(utx);
            });
            try {

                var paymentAmount = escrow.amount * constants.paymentAmount;
                var paymentSatosihis = bitcoreFactory.btcToSatoshi(paymentAmount);

                var escrowFee = escrow.amount * constants.escrowFee;
                var escrowFeeSatoshi = bitcoreFactory.btcToSatoshi(escrowFee);

                console.log(escrowFeeSatoshi, paymentSatosihis);

                var multiSigTx = new bitcore.Transaction();


                multiSigTx.from(utxo, escrow.publicKeys, 2)
                    .to(escrow.recipientAddress, paymentSatosihis - constants.transactionFee)
                    .to(constants.feeAddress, escrowFeeSatoshi)
                    .fee(constants.transactionFee)
                    .change(change);

                multiSigTx.sign([escrow.signed, privateKey]);
                if (multiSigTx.isFullySigned()) {
                    var txSerialized = multiSigTx.serialize(true);
                    bitcoreFactory.broadCastTransaction(txSerialized, req, res, escrow, broadcastCallback);
                } else {
                    res.jsonp({
                        errors: 'Signature error',
                        success: false,
                        data: null
                    });
                }
            } catch (e) {
                console.log(e);
                res.jsonp({
                    errors: 'Error signing escrow, is the key correct?',
                    success: false,
                    data: null
                });
            }
        } else {
            res.jsonp({
                errors: 'Escrow not found or in wrong status',
                success: false,
                data: null
            });
        }
    });


}