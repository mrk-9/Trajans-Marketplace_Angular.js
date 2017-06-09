import * as mongoose from 'mongoose';

var Order = mongoose.model('Order');
var _ = require('lodash');
var Q = require('q');
var fs = require('fs-extra');

function getBitcoinExchangeRate() {
    return Q.nfcall(fs.readJson, 'exchangerates.json', 'utf-8');
}

function calculateBitcoinCost(cost, btcRate) {
    var btcCost = cost / btcRate;
    return btcCost.toFixed(8);
}

function getHighestShippingCost(arr) {
    var highest = _.max(arr, function(chr) {
        return chr.chosenShippingMethod.shippingCost;
    });
    return highest.chosenShippingMethod.shippingCost;
}

function getHighestShippingAdditionalCost(arr) {
    var highest = _.max(arr, function(chr) {
        return chr.chosenShippingMethod.shippingCost;
    });
    return highest.chosenShippingMethod.shippingAdditionalCost;
}

function getadditionalShippingCosts(arr) {
    var total = 0;
    _.forEach(arr, function(item) {
        total += parseFloat(item.chosenShippingMethod.shippingAdditionalCost) * parseFloat(item.quantity);
    });
    return total;
}

function getEscrowCostsAUD(arr) {
    var total = 0;
    _.forEach(arr, function(item) {
        total += parseFloat(item.priceFiat) / 100 * 1;
    });
    return total;
}

function getEscrowCostsBTC(arr, btcRate) {
    var total = 0;
    var orderItems = [];
    _.forEach(arr, function(item) {
        var cost = parseFloat(item.priceFiat);
        item.individualBTCCost = calculateBitcoinCost(cost, btcRate);
        orderItems.push(item);
    });
    return orderItems;
}

function getTotalCosts(arr) {
    var total = 0;
    _.forEach(arr, function(item) {
        total += parseFloat(item.priceFiat) * parseFloat(item.quantity);
    });
    return total;
}

function calculateIndividualOrderItemCostBTC(arr, btcRate) {
    var total = 0;
    var orderItems = [];
    _.forEach(arr, function(item) {
        var cost = parseFloat(item.priceFiat);
        item.orderBTCCost = calculateBitcoinCost(cost * item.quantity, btcRate);
        orderItems.push(item);
    });
    return orderItems;
}

function calculateIndividualSingleItemCostBTC(arr, btcRate) {
    var total = 0;
    var orderItems = [];
    _.forEach(arr, function(item) {
        var cost = parseFloat(item.priceFiat);
        item.individualBTCCost = calculateBitcoinCost(cost, btcRate);
        orderItems.push(item);
    });
    return orderItems;
}

function saveOrder(order) {
    order.markModified('order_items');
    order.save(function(err) {
        if (err) {
            console.log(err);
        }
    });
}

exports.calculateShipping = function(orders, res) {
    getBitcoinExchangeRate().then(function(rate) {
        var btcRate = rate.aud.spot;
        for (var i = 0; i < orders.length; i++) {
            if (!orders[i].orderProceeded) {
                var additionalShippingCost = getadditionalShippingCosts(orders[i].order_items);
                var highestShipping = getHighestShippingCost(orders[i].order_items);
                var highestShippingAdditionalCost = getHighestShippingAdditionalCost(orders[i].order_items);
                var totalShippingCost = additionalShippingCost + highestShipping;
                var totalShippingCostMinusHighestAdditionalShippingCost = totalShippingCost - highestShippingAdditionalCost;
                var totalOrderPrice = getTotalCosts(orders[i].order_items);
                var totalOverallCostAUD = totalShippingCostMinusHighestAdditionalShippingCost ? totalShippingCostMinusHighestAdditionalShippingCost + totalOrderPrice : totalOrderPrice;
                var totalOverallCostBTC = calculateBitcoinCost(totalOverallCostAUD, btcRate);
                orders[i].order_items = calculateIndividualOrderItemCostBTC(orders[i].order_items, btcRate);
                orders[i].order_items = calculateIndividualSingleItemCostBTC(orders[i].order_items, btcRate);
                orders[i].totalShippingCost = totalShippingCostMinusHighestAdditionalShippingCost ? totalShippingCostMinusHighestAdditionalShippingCost : 0;
                orders[i].totalShippingCostBTC = calculateBitcoinCost(totalShippingCostMinusHighestAdditionalShippingCost ? totalShippingCostMinusHighestAdditionalShippingCost : 0, btcRate);
                orders[i].totalOverallCostAUD = totalOverallCostAUD;
                orders[i].totalOverallCostBTC = totalOverallCostBTC;
                saveOrder(orders[i]);
            }
        }
        res.jsonp(orders);
    });
};
