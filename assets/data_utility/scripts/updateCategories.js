// jshint ignore: start

let _ = require('lodash');
let db = require('../db').getDb(['categories', 'primarycategories', 'tertiarycategories', 'listings']);

module.exports = {
    run
};

function run() {
    return updateHomeAndGardenCategories()
        .then(() => {
            return updateSportsCategories();
        })
        .then(() => {
            return updateSportsListings();
        });
}

function updateHomeAndGardenCategories() {
    return db.tertiarycategories.findOneAsync({name: "furniture"})
        .then((tertiarycategory) => {
            let newItems = {
                mattresses: 'Mattresses',
                barstools: 'Barstools',
                bookcasesabinets: 'Bookcases & Cabinets'
            };

            tertiarycategory.categories = Object.assign(tertiarycategory.categories, newItems);

            return db.tertiarycategories.saveAsync(tertiarycategory);
        });
}

function updateSportsCategories() {
    const alias = "sportsfitness";
    const title = "Sports, Fitness & Camping";

    return db.categories.findOneAsync({alias: alias})
        .then((category) => {
            category.title = title;
            category.end = false;

            db.categories.saveAsync(category);

            return db.primarycategories.findOneAsync({alias: alias});
        })
        .then((primaryCategory) => {
            if (primaryCategory) return;

            let newCategories = {
                camping: 'Camping',
                sports: 'Sports',
                fitness: 'Fitness'
            };

            let newPrimaryCategory = {
                name: title,
                alias: alias,
                end: true,
                categories: Object.assign({}, newCategories)
            };

            return db.primarycategories.saveAsync(newPrimaryCategory)
                .then(() => {
                    return newCategories;
                });
        })
        .then((categories) => {
            let actions = [];

            _.forOwn(categories, function(value, key) {
                let action = db.tertiarycategories.findOneAsync({name: key})
                    .then((cat) => {
                        if (cat) return;

                        let newItem = {
                            name: key,
                            categories: getTertiarySportsCategories(key)
                        };

                        return db.tertiarycategories.saveAsync(newItem);
                    });

                actions.push(action);
            });

            return Promise.all(actions);
        })
        .then(() => {
            db.tertiarycategories.removeAsync({name: alias});
        });
}

function updateSportsListings() {
    let query = {
        category: "sportsfitness",
        primaryCategory: ''
    };

    return db.listings.findAsync(query)
        .then((listings) => {
            _.forEach(listings, (listing) => {
                listing.primaryCategory = 'sports';
                listing.tertiaryCategory = 'other';

                db.listings.saveAsync(listing);
            });
        });
}

function getTertiarySportsCategories(key) {
    let result = {};

    switch (key) {
        case 'camping':
            result = {
                hiking: 'Hiking',
                sleepingbags: 'Sleeping Bags',
                solar: 'Solar',
                tentsswags: 'Tents & Swags',
                other: 'Other'
            };
            break;
        case 'sports':
            result = {
                bicycles: 'Bicycles',
                boxingmartialarts: 'Boxing & Martial Arts',
                golf: 'Golf',
                racquetsports: 'Racquet Sports',
                skateboardsrollerblades: 'Skateboards & Rollerblades',
                snowsports: 'Snow Sports',
                sportsbags: 'Sports Bags',
                surfing: 'Surfing',
                other: 'Other'
            };
            break;
        case 'fitness':
            result = {
                accessories: 'Accessories',
                cardioequipment: 'Cardio Equipment',
                strengthtraining: 'Strength Training',
                yogapilates: 'Yoga and Pilates',
                other: 'Other'
            };
            break;
        default:
            break;
    }

    return result;
}