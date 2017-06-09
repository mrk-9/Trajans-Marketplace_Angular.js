import * as mongoose from 'mongoose';

import constants from '../constants/constants';

let Featured = mongoose.model('Featured');

export default {
    getFeaturedSubscriptionForUser,
    createNewFeature,
    getFeaturedPending,
    removeFeature
};

async function getFeaturedSubscriptionForUser(userId) {
    return await Featured.findOne({user: userId});
}

async function createNewFeature(address, userId, amount) {
    let featured = new Featured();

    featured.paymentAddress = address.toString();
    featured.user = userId;
    featured.amount = amount;

    return await featured.save();
}

async function getFeaturedPending() {
    let query = {
        status: constants.featuredStatuses.pending
    };

    return await Featured.find(query);
}

async function removeFeature(id, userId) {
    let query: any = {};

    if (id) query = {_id: id};

    if (userId) query = {user: userId};

    return await Featured.remove(query);
}