// jshint ignore: start

let _ = require('lodash');
let db = require('../db').getDb(['users', 'listings']);

module.exports = {
    run
};

function run() {
    return db.users.findAsync()
        .then((users) => {
            let actions = [];

            _.forEach(users, (user) => {
                user.userListings = [];

                let action = db.listings.findAsync({user: user._id, listingActive: true})
                    .then((listings) => {
                        let listingIds = [];

                        _.forEach(listings, (listing) => {
                            listingIds.push(listing._id);
                        });

                        user.userListings = listingIds;

                        return db.users.saveAsync(user);
                    });

                actions.push(action);
            });

            return Promise.all(actions);
        });
}