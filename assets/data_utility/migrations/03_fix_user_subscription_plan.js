// jshint ignore: start

let _ = require('lodash');
let db = require('../db').getDb(['listings', 'users', 'subscriptionplans']);

exports.migrate = function () {
    let planId = null;

    return db.subscriptionplans.findOneAsync({planId: 'hrdb'})
        .then((plan) => {
            if (plan) planId = plan._id;

            return db.listings.distinctAsync('user', {});
        })
        .then((userIds) => {
            return db.users.findAsync({_id: {$in: userIds}, subscriptionPlan: null});
        })
        .then((users) => {
            _.forEach(users, (user) => {
                user.subscriptionPlan = planId;
                user.subscriptionStatus = 'Active';

                db.users.saveAsync(user);
            });
        });
};
