import * as mongoose from 'mongoose';
import * as _ from 'lodash';

import bitcoreFactory from '../factory/bitcoreFactory';
import escrowAuditFactory from '../factory/escrowAuditFactory';
import config from '../config/config';
import constants from '../constants/constants';
let escrowStatuses = constants.escrowStatuses;
import helper from './_controllerHelper';
import hdKeyRepository from '../repositories/hdKeyRepository';

var guid = require('node-uuid');
var bitcore = require('bitcore');
var Escrow = mongoose.model('Escrow');
var Insight = require('bitcore-explorers').Insight;
var request = require('request');
var Order = mongoose.model('Order');
var BlogPost = mongoose.model('BlogPost');
var crypto = require('crypto');

if (config.testNet) {
    bitcore.Networks.defaultNetwork = bitcore.Networks.testnet;
}

export default {
    index,
    uuid,
    admin,
    getEscrow,
    escrowById,
    decodeMultisig,
    releaseFunds,
    createHdKey,
    getHdKey
};

function index(req, res) {
    BlogPost.find(function(err, posts) {
        if (err) {
            res.render('index', {
                user: req.user || null,
                env: process.env.NODE_ENV
            });
        } else {
            res.render('index', {
                user: req.user || null,
                posts: posts,
                env: process.env.NODE_ENV
            });
        }
    });
}

function uuid(req, res) {
    var uuid = guid.v4();
    res.jsonp({
        uuid: uuid
    });
}

function admin(req, res) {
    res.render('admin', {
        user: req.user || null,
        request: req
    });
}

function getEscrow(req, res) {
    if (req.escrow) {
        res.jsonp(req.escrow);
    }
}

function escrowById(req, res, next, id) {
    Escrow.findOne({
        _id: id
    }).exec(function(err, escrow) {
        if (err) return next(err);
        if (!escrow) return next(new Error('Failed to load escrow ' + id));
        req.escrow = escrow;
        next();
    });
}

function decodeMultisig(req, res) {
    var key = req.body.key;
    var password = req.body.password;
    if (key && password) {
        var algorithm = 'aes-256-ctr';
        var decipher = crypto.createDecipher(algorithm, password);
        var dec = decipher.update(key, 'hex', 'utf8');
        dec += decipher.final('utf8');
        res.jsonp({
            key: dec
        });
    }
}

function releaseFunds(req, res, next) {
    delete (global as any)._bitcore;
    var escrowId = req.body.relaseEscrowId;
    var change = req.body.change;
    var toAddress = req.body.toAddress;
    var privateKeys = req.body.keys;
    try {
        Escrow.findById(escrowId, function(err, escrow) {
            var insight = new Insight();
            if (err) return err;
            if (config.testNet) {
                insight = new Insight('https://test-insight.bitpay.com');
            } else {
                insight = new Insight();
            }
            if (escrow) {
                insight.getUnspentUtxos(escrow.escrowAddress, function(err, utxos) {
                    if (err) {
                        res.jsonp({
                            errors: err,
                            success: false,
                            data: null
                        });
                    } else {
                        console.log(utxos);
                        if (utxos.length) {
                            console.log(utxos);
                            try {
                                var change = bitcore.Address.fromString(change || escrow.change);
                                var utxo = utxos.map(function(utx) {
                                    return bitcoreFactory.generateUtxo(utx);
                                });
                                var paymentAmount = escrow.amount * constants.paymentAmount;
                                var paymentSatosihis = bitcoreFactory.btcToSatoshi(paymentAmount);
                                var escrowFee = escrow.amount * constants.escrowFee;
                                var escrowFeeSatoshi = bitcoreFactory.btcToSatoshi(escrowFee);
                                var multiSigTx = new bitcore.Transaction()
                                    .from(utxo, escrow.publicKeys, 2)
                                    .to(toAddress, paymentSatosihis - constants.transactionFee)
                                    .to(constants.feeAddress, escrowFeeSatoshi)
                                    .change(change);
                                // Set fee
                                multiSigTx.fee(multiSigTx.getFee());
                                //Sign
                                multiSigTx.sign(privateKeys);
                                // Check signed
                                if (multiSigTx.isFullySigned()) {
                                    // broadcast
                                    var txSerialized = multiSigTx.serialize(true);
                                    insight.broadcast(txSerialized, function(err, returnedTxId) {
                                        if (err) {
                                            res.jsonp({
                                                errors: err,
                                                success: false,
                                                data: null
                                            });
                                        } else {
                                            escrow.txid = returnedTxId;
                                            escrow.status = escrowStatuses.ra;
                                            escrow.escrowAudits.push(escrowAuditFactory.createEscrowAudit('Escrow Dispute Resolved By Trajans', req.user));
                                            escrow.save(function(err, escrow) {
                                                if (escrow.order) {
                                                    updateOrderStatus(escrow.order._id, escrowStatuses.ra);
                                                }
                                                res.jsonp({
                                                    txid: returnedTxId
                                                });
                                            });
                                        }
                                    });
                                } else {
                                    res.jsonp({
                                        errors: 'Signature error',
                                        success: false,
                                        data: null
                                    });
                                }
                            } catch (e) {
                                return next(new Error(e));
                            }
                        } else {
                            res.jsonp({
                                errors: 'No UTXO',
                                success: false,
                                data: null
                            });
                        }
                    }

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
}

async function createHdKey(req, res) {
    try {
        let keys = await hdKeyRepository.getHdKeys();

        let newKey = generateKey();

        if (_.isEmpty(keys)) {
            await hdKeyRepository.createHdKey(newKey);
        } else {
            let hdKey = _.first(keys);

            await hdKeyRepository.updateHdKey(hdKey, newKey);
        }

        helper.sendData(newKey, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

async function getHdKey(req, res) {
    try {
        let keys = await hdKeyRepository.getHdKeys();

        let data = {
            success: true,
            key: keys.length ? _.first(keys) : 'No key'
        };

        helper.sendData(data, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
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

function generateKey() {
    let hdPrivateKey = new bitcore.HDPrivateKey(); //returns xpriv...
    let hdPublicKey = hdPrivateKey.hdPublicKey;

    return {
        hdPrivateKey: hdPrivateKey.toString(),
        hdPublicKey: hdPublicKey.toString()
    };
}

function emailPrivateKeyToAdmin(key) {
    //TODO - Email the key here with e-mail service.
    return;
}
