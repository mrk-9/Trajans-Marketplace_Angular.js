import * as bitcore from 'bitcore';
import * as uuid from 'node-uuid';
import * as request from 'request';
import * as crypto from 'crypto';
import * as _ from 'lodash';
import config from '../config/config';
delete (global as any)._bitcore;
let Insight = require('bitcore-explorers').Insight;

import constants from  '../constants/constants';
import externalApiRepository from '../repositories/externalApiRepository';

export default {
    generateAddress,
    generateMultisigAddress,
    validateAddress,
    validatePrivateKey,
    getUtxos,
    getBalanceFromUtxo,
    getBitPosBalance,
    getEscrowBalance,
    generateUtxo,
    getUnspent,
    getUnspentSimple,
    getUnspentUser,
    broadCastUserTransaction,
    broadCastTransaction,
    broadCastTransactionSimple,
    satoshiToBTC,
    btcToSatoshi,
    createEncryptionPassword,
    encryptPrivateKey,
    decryptPrivateKey
}

if (config.testNet) {
    bitcore.Networks.defaultNetwork = bitcore.Networks.testnet;
}

function generateAddress() {
    let privateKey = new bitcore.PrivateKey();
    let publicAddress = privateKey.toAddress();

    return {
        publicAddress: publicAddress.toString(),
        privateKey: privateKey.toString()
    };
}

function generateMultisigAddress() {
    let privateKeys = [];
    let publicKeys = [];
    let privKeysStr = [];

    for (let i = 0; i < 3; i++) {
        let privateKey = new bitcore.PrivateKey();

        privKeysStr.push(privateKey.toString());
        privateKeys.push(privateKey);
    }

    _.forEach(privateKeys, function(key) {
        let address = new bitcore.PublicKey(key).toString();
        publicKeys.push(address);
    });

    let p2shAddress = new bitcore.Address(publicKeys, 2);
    let multiSigAddress = p2shAddress.toString();
    let build = bitcore.Script.buildMultisigOut(publicKeys, 2);
    let redeemScript = build.toScriptHashOut().toString();

    return {
        multiSigAddress: multiSigAddress,
        redeemScript: redeemScript,
        publicKeys: publicKeys,
        privateKeys: privKeysStr
    };
}

function validateAddress(address): boolean {
    return !!bitcore.Address.isValid(address);
}

function validatePrivateKey(key): boolean {
    return !!bitcore.PrivateKey.isValid(key);
}

async function getUtxos(address) {
    let utxosData = await externalApiRepository.getUtxos(address);

    return {
        utxos: utxosData,
        balance: getBalanceFromUtxo(utxosData)
    };
}

function getBalanceFromUtxo(utxos): number {
    let balance = 0;

    _.forEach(utxos, function(utxo) {
        if (utxo.confirmations >= constants.confirmations) {
            balance += utxo.amount;
        }
    });

    return balance;
}

function getBitPosBalance(bitpos, address, order, io, callback) {
    if (address) {
        let url = '';

        if (config.testNet) {
            url = 'http://tbtc.blockr.io/api/v1/address/balance/';
        } else {
            url = 'http://btc.blockr.io/api/v1/address/balance/';
        }

        request(url + address, function(error, response, body) {
            if (error) {
                return error;
            } else {
                let data = JSON.parse(body);

                if (data && data.status === 'success') {
                    let address = data.data;
                    callback(bitpos, address, io, order);
                }
            }
        });
    }
}

function getEscrowBalance(address, callback, escrow, res, req) {
    if (address) {
        let url = '';

        if (config.testNet) {
            url = 'http://tbtc.blockr.io/api/v1/address/balance/';
        } else {
            url = 'http://btc.blockr.io/api/v1/address/balance/';
        }

        request(url + address, function(error, response, body) {
            if (error) {
                return error;
            } else {
                let data = JSON.parse(body);

                if (data && data.status === 'success') {
                    let address = data.data;
                    callback(req, res, address, escrow);
                }
            }
        });
    }
}

function generateUtxo(utx) {
    return new bitcore.Transaction.UnspentOutput(utx);
}

function getUnspent(address, callback, escrow, privateKey, res, req) {
    let insight;

    if (config.testNet) {
        insight = new Insight('https://test-insight.bitpay.com');
    } else {
        insight = new Insight();
    }

    insight.getUnspentUtxos(address, function(err, utxos) {
        if (err) {
            res.jsonp({
                success: false,
                errors: 'Broadcast transaction failed, try again later',
                data: null
            });
        } else {
            callback(req, res, utxos, escrow, privateKey);
        }
    });
}

function getUnspentSimple(address, callback) {
    let insight;

    if (config.testNet) {
        insight = new Insight('https://test-insight.bitpay.com');
    } else {
        insight = new Insight();
    }

    insight.getUnspentUtxos(address, function(err, utxos) {
        if (err) {
            callback('Error getting utxos', null);
        } else {
            callback(null, utxos);
        }
    });
}

function getUnspentUser(address, to, amount, privateKey, callback, res, req) {
    let insight;

    if (config.testNet) {
        insight = new Insight('https://test-insight.bitpay.com');
    } else {
        insight = new Insight();
    }

    insight.getUnspentUtxos(address, function(err, utxos) {
        if (err) {
            res.jsonp({
                success: false,
                errors: 'Broadcast transaction failed, try again later',
                data: null
            });
        } else {
            callback(req, res, address, to, amount, utxos, privateKey);
        }
    });
}

function broadCastUserTransaction(txSerialized, req, res, callback) {
    let insight;

    if (config.testNet) {
        insight = new Insight('https://test-insight.bitpay.com');
    } else {
        insight = new Insight();
    }

    insight.broadcast(txSerialized, function(err, returnedTxId) {
        if (err) {
            callback(null, null, null, res);
        } else {
            callback(returnedTxId, req, res);
        }
    });
}

function broadCastTransaction(txSerialized, req, res, escrow, callback) {
    let insight;

    if (config.testNet) {
        insight = new Insight('https://test-insight.bitpay.com');
    } else {
        insight = new Insight();
    }

    insight.broadcast(txSerialized, function(err, returnedTxId) {
        if (err) {
            console.log(err);
            callback(null, null, null, res);
        } else {
            callback(escrow, returnedTxId, req, res);
        }
    });
}

function broadCastTransactionSimple(txSerialized, callback) {
    let insight;

    if (config.testNet) {
        insight = new Insight('https://test-insight.bitpay.com');
    } else {
        insight = new Insight();
    }

    insight.broadcast(txSerialized, function(err, returnedTxId) {
        if (err) {
            callback('error', null);
        } else {
            callback(null, returnedTxId);
        }
    });
}

function satoshiToBTC(satoshis) {
    return bitcore.Unit.fromSatoshis(satoshis).to(bitcore.Unit.BTC);
}

function btcToSatoshi(btc) {
    return bitcore.Unit.fromBTC(btc).to(bitcore.Unit.satoshis);
}

function createEncryptionPassword() {
    return uuid.v1();
}

function encryptPrivateKey(privateKey, password) {
    const algorithm = 'aes-256-ctr';

    let cipher = crypto.createCipher(algorithm, password);

    let crypted = cipher.update(privateKey, 'utf8', 'hex');
    crypted += cipher.final('hex');

    return crypted;
}

function decryptPrivateKey(privateKey, password) {
    const algorithm = 'aes-256-ctr';

    let decipher = crypto.createDecipher(algorithm, password);

    let dec = decipher.update(privateKey, 'hex', 'utf8');
    dec += decipher.final('utf8');

    return dec;
}
