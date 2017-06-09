'use strict';

var Promise = require('bluebird');
var mongojs = require('mongojs');
var _ = require('lodash');
var config = require('./config.json');

Promise.promisifyAll([
    require('mongojs/lib/collection'),
    require('mongojs/lib/database'),
    require('mongojs/lib/cursor')
]);

module.exports = {
    getDb: getDb
};

function getDb(collections) {
    return mongojs(getConnectionString(), collections);
}

function getConnectionString() {
    var result = 'mongodb://';

    if (config.db.username) {
        result += config.db.username + ':' + config.db.password + '@';
    }

    result += config.db.host + ':' + config.db.port + '/' + config.db.dbName;

    return result;
}
