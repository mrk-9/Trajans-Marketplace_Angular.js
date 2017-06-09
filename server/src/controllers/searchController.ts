import * as _ from 'lodash';
import axios from 'axios';

import helper from './_controllerHelper';
import listingRepository from '../repositories/listingRepository';

export default {
    listingsByCategory,
    performSearch,
    searchListings
}

async function listingsByCategory(req, res, next, category) {
    try {
        let listings = await listingRepository.getActiveListingsByCategory(category);

        let activeListings = getListingsWithActiveUserSubscription(listings);

        helper.sendData(activeListings, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

async function performSearch(req, res) {
    try {
        let searchQuery = JSON.parse(req.query.searchQuery);

        let data = await listingRepository.performSearch(searchQuery);

        data.listings = getListingsWithActiveUserSubscription(data.listings);

        helper.sendData(data, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

async function searchListings(req, res) {
    try {
        let searchQuery = JSON.parse(req.query.searchQuery);

        let currency = searchQuery.currency;
        let minPrice = searchQuery.minPrice;
        let maxPrice = searchQuery.maxPrice;

        if (currency && currency !== 'AUD') {
            let response = await axios.get('http://api.fixer.io/latest?base=AUD');

            let exchangeRate = response.data.rates[currency];

            minPrice = 1 / exchangeRate * minPrice;
            maxPrice = 1 / exchangeRate * maxPrice;

            searchQuery.minPrice = minPrice.toFixed(2);
            searchQuery.maxPrice = maxPrice.toFixed(2);
        }

        let data = await listingRepository.searchListings(searchQuery);

        data.listings = getListingsWithActiveUserSubscription(data.listings);

        helper.sendData(data, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

//helper methods

function getListingsWithActiveUserSubscription(listings) {
    let result = _.filter(listings, (listing) => {
        return listing.user.subscriptionStatus[0] === 'Active';
    });

    return result;
}
