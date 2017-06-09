// jshint ignore: start

let _ = require('lodash');
let db = require('../db').getDb(['subscriptionplans']);

module.exports = {
    run
};

function run() {
    return db.subscriptionplans.findOneAsync({planNo: 1})
        .then((plan) => {
            for (let i in plan.features) {
                if (plan.features[i] === 'Your owns tore front') {
                    plan.features[i] = 'Your own store front';
                }
            }

            return db.subscriptionplans.saveAsync(plan);
        });
}
