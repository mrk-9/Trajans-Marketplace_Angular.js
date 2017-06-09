'use strict';

var moment = require('moment');
var Promise = require('bluebird');
var _ = require('lodash');
var helper = require('./httpHelper');
var db = require('./db').getDb(['countries', 'areas']);

function importData() {
    var startTime = new Date().getTime();

    importCountries()
        .then(function () {
            console.log('Countries and areas import completed!');
            var endTime = new Date().getTime();
            var ms = endTime - startTime;
            console.log('Execution time: ' + moment.utc(ms).format('HH:mm:ss.SSS'));
        });
}

importData();

function importCountries() {
    return db.countries.findAsync()
        .then(function (data) {
            if (data) {
                return db.countries.removeAsync();
            }
        })
        .then(function () {
            var actions = [];

            var countries = require('./data/shippingCountries.json').geonames;

            _.forEach(countries, function (country) {
                var countryObject = {
                    name: country.countryName,
                    code: country.countryCode
                };

                var action = getAreasForCountry(countryObject)
                    .then(function (areas) {
                        countryObject.areas = areas;

                        return db.countries.insert(countryObject);
                    });

                actions.push(action);
            });

            return Promise.all(actions);
        });
}

function getAreasForCountry(country) {
    var url = 'http://api.geonames.org/searchJSON?username=trajans.market&lang=en&country=' + country.code;

    return helper.httpGet(url)
        .then(function (data) {
            if (!data) {
                console.log('HTTP Error: cannot get areas for country ' + country.name);
                return [];
            }

            var result = [];
            var areasLookup = {};

            _.forEach(data.geonames, function (geoname) {
                // Check to see whether the area already exists in the array (duplicate areas for some countries)
                if (areasLookup[geoname.name]) return;

                var area = {
                    geonameId: geoname.geonameId,
                    name: geoname.name,
                    isAllAreas: geoname.name === country.name
                };

                areasLookup[geoname.name] = {};

                result.push(area);
            });

            return result;
        });
}
