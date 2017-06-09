import * as mongoose from 'mongoose';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as every from 'every-moment';
import * as bitcore from 'bitcore';

import constants from '../constants/constants';
import bitcoreFactory from './bitcoreFactory';
import pathHelper from '../helpers/pathHelper';

export default {
    init
};

var EscrowRunner = function(io, address) {
    var self = this;
    var User = mongoose.model('User'),
    SubscriptionPlan = mongoose.model('SubscriptionPlan');
    self.io = io;
    self.address = address;
    self.balance = 0;
    self.order = null;
    self.escrow = null;
    self.checkBalance = async function(callback) {
        if (self.address) {
            //TODO refactor
            let address = await bitcoreFactory.getUtxos(self.address);

            callback(null, address);
        }
    };
    self.processTransaction = function(escrow, order, balance) {
        self.order = order;
        self.escrow = escrow;
        var utxos = self.generateUtxos(escrow.escrowAddress, function(err, utxos) {
            if (err) {
                return err;
            } else {
                var feePercentage = 0;
                var planGroup = 'Business';

                User.findById(self.escrow.seller).exec(function(err, user){
                    if(err) {
                        console.log(err);
                        return err;
                    }
                    SubscriptionPlan.findById(user.subscriptionPlan, function(err, plan){
                         if(!plan) {
                             console.log(err);
                             return err;
                         }
                         self.decryptPrivateKey(escrow.privateKey, function(privateKey) {
                            var transaction = new bitcore.Transaction();

                            var ourFee = bitcoreFactory.btcToSatoshi((self.escrow.ourFeeBTC));
                            var satoshi = bitcoreFactory.btcToSatoshi(self.order.bitcoin_amount /1) - ourFee - 10000; //full amount - our fee - network fee
                            
                            transaction
                                .from(utxos)
                                .to(escrow.recipientAddress, satoshi)
                                .to(constants.feeAddress, ourFee)
                                .change(escrow.recipientAddress)
                                .fee(10000)
                                .sign(privateKey);
                            var serialised = transaction.serialize(true);
                            self.broadcastTransaction(transaction, serialised);
                        });
                    });
                });
            }
        });
    };
    self.generateUtxos = function(address, callback) {
        bitcoreFactory.getUnspentSimple(address, function(err, utxos) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, utxos);
            }
        });
    };
    self.broadcastTransaction = function(transaction, serialised, callback) {
        if (serialised && (transaction && transaction.verify())) {
            bitcoreFactory.broadCastTransactionSimple(serialised, function(err, txid) {
                if (err) {
                    return err;
                } else {
                    self.updateEscrowAndOrder(self.escrow, self.order, txid);
                }
            });
        }
    };
    self.updateEscrowAndOrder = function(escrow, order, txid) {
        escrow.status = 'COMPLETE';
        order.status = 'COMPLETE';
        escrow.txid = txid;
        escrow.save();
        order.save();
    };
    self.decryptPrivateKey = function(key, callback) {
        let keyPath = pathHelper.getDataRelative('./.hashKey');
        fs.readFile(keyPath, 'utf8', function read(err, hash) {
            callback(bitcoreFactory.decryptPrivateKey(key, hash));
        });
    };
};

function init(io) {
    var Order = mongoose.model('Order'),
    Escrow = mongoose.model('Escrow');
    every(5, 'minutes', function() {
        console.log('Running escrow scheduler...');
        Escrow.find({ status: 'PAYMENT RECEIVED', directEscrow: true, type: constants.escrowTypes.n }) // FIND ALL NORMAL TRANSACTION ESCROWS
        .populate('order')
        .exec(function(err, escrows) {
            if (!err && escrows.length) {
                _.forEach(escrows, function(escrow) {
                    var er = new EscrowRunner(io, escrow.escrowAddress);
                    var balance = er.checkBalance(function(err, address) {
                        var bal = address.balance;
                        if (bal && bal >= escrow.order.bitcoin_amount/1) {
                            er.processTransaction(escrow, escrow.order, bal);
                        } else {
                            return;
                        }
                    });
                });
            } else {
                console.log('No escrows to process at this time...');
            }
        });
    });
}

