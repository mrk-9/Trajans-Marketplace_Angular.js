// jshint ignore: start

let _ = require('lodash');
let db = require('../db').getDb(['listings', 'users']);

exports.migrate = function () {

    return db.users.findAsync()
        .then((users) => {
            let actions = [];

            _.forEach(users, (user) => {
                let action = db.listings.findAsync({user: user._id})
                    .then((listings) => {
                        _.forEach(listings, (listing) => {
                            listing.isVerifiedUser = user.verified;

                            return db.listings.saveAsync(listing);
                        })
                    });

                actions.push(action);
            });

            return Promise.all(actions);
        });
};
