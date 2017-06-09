'use strict';

const mongojs = require('mongojs');
const config = require('./config.json');
const moment = require('moment');
const CustomPromise = require('bluebird');

function migrate() {
    let startTime = new Date().getTime();

    let migrationPromises = [
        require('./migrations/01_plan_updates').migrate(),
        require('./migrations/02_fix_listing_locations').migrate(),
        require('./migrations/03_fix_user_subscription_plan').migrate(),
        require('./migrations/04_add_veriefied_user_to_listings').migrate()
    ];

    CustomPromise.all(migrationPromises)
        .then(function() {
            console.log('All migration completed!');
            let endTime = new Date().getTime();
            let ms = endTime - startTime;
            console.log('Execution time: ' + moment.utc(ms).format('HH:mm:ss.SSS'));
        });
}

migrate();
