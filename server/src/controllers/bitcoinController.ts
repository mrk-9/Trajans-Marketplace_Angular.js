import * as mongoose from 'mongoose';
import * as fs from 'fs-extra';

import bitcoreFactory from '../factory/bitcoreFactory';
import helper from './_controllerHelper';

let MarketCap = mongoose.model('MarketCap');

export default {
    exchangeRates,
    validateAddress,
    marketCap
};

function exchangeRates(req, res) {
    fs.readJson('exchangerates.json', function(err, rates) {
        if (err) {
            console.log(err);
            return res.status(400).send({
                message: helper.getErrorMessage(err)
            });
        } else {
            res.send({
                rates: rates
            });
        }
    });
}

function validateAddress(req, res) {
    var valid = bitcoreFactory.validateAddress(req.body.address);
    res.json({
        valid: valid
    });
}

function marketCap(req, res) {
    MarketCap.find(function(err, cap) {
        if (err) {
            console.log(err);
            return res.status(400).send({
                message: helper.getErrorMessage(err)
            });
        } else {
            res.json(cap[0]);
        }
    });

}
