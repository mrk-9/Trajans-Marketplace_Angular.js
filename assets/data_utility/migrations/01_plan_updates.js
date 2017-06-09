// jshint ignore: start

const Promise = require('bluebird');
const _ = require('lodash');
const db = require('../db').getDb(['subscriptionplans']);

exports.migrate = function () {
    let modifySecond = db.collection('subscriptionplans')
        .findAndModifyAsync({
            query: {planId: 'qqkg'},
            update: {$set: {tagline: 'Become verified and accept BTC Direct payments'}},
            new: true
        });

    let modifyFirst = db.collection('subscriptionplans')
        .findAndModifyAsync({
            query: {planId: 'hrdb'},
            update: {$set: {tagline: 'Start today for less - accept moderated payments'}},
            new: true
        });

    return Promise.all([modifyFirst, modifySecond])
        .catch(function (err) {
            console.log(err);
        });
};
