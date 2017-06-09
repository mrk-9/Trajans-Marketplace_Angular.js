// jshint ignore: start

const Promise = require('bluebird');
const _ = require('lodash');
const db = require('../db').getDb(['listings']);

exports.migrate = function () {
    let updateMelbourneLocations = db.collection('listings')
        .updateAsync({itemLocation: {$in: [', 3000', ', , 3000']}}, {$set: {itemLocation: 'Melbourne, Australia'}}, {multi: true});

    let updateAustraliaLocations = db.collection('listings')
        .updateAsync({itemLocation: 'Australia'}, {$set: {itemLocation: '- All Areas -, Australia'}}, {multi: true});

    let updateWorldWideLocations = db.collection('listings')
        .updateAsync({itemLocation: 'World wide'}, {$set: {itemLocation: '- All Areas -, World wide'}}, {multi: true});

    return Promise.all([updateMelbourneLocations, updateAustraliaLocations, updateWorldWideLocations]);
};
