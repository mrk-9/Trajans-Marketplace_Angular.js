import * as _ from 'lodash';

import constants from '../constants/constants';
import emailService from '../services/emailService';
import bitcoinService from '../services/bitcoinService';
import emailMerges from '../emails/emailMerges.js';
import helper from './_controllerHelper';
import subscriptionPlanRepository from '../repositories/subscriptionPlanRepository';
import userRepository from '../repositories/userRepository';
import listingRepository from '../repositories/listingRepository';
import featuredRepository from '../repositories/featuredRepository';
import hdKeyRepository from '../repositories/hdKeyRepository';

var bitcore = require('bitcore');

export default {
    getUserSubscription,
    createSubscription,
    getPlanByName,
    cancelSubscription,
    getAllSubscriptionPlans,
    createFeaturedSubscription
};

async function getUserSubscription(req, res) {
    try {
        let user = req.user;

        if (!user) return helper.sendData({}, res);

        if (!user.subscriptionPlan) {
            let message = 'That\'s Strange.. we couldn\'t find you in our subscription database. ' +
                'Please accept our apologies and contact our support team who should be able to assist you with this problem.';

            let data = {
                success: false,
                error: message
            };

            return helper.sendData(data, res);
        }

        let plan = await subscriptionPlanRepository.getSubscriptionPlanById(user.subscriptionPlan);

        return helper.sendData(plan, res);
    } catch (err) {
        return helper.sendFailureMessage(err, res);
    }
}

async function createSubscription(req, res) {
    try {
        let userId = req.user._id;
        let planName = req.query.planname;

        let plan = await subscriptionPlanRepository.getPlanByName(planName);

        if (!plan) throw new Error('Cannot find plan by name.');

        let user = await userRepository.updateUserSubscriptionPlan(userId, plan, 'Active');

        sendSubscriptionConfirmationEmail(user, plan.group);

        if (plan.name !== 'businessplus') {
            await listingRepository.updateListingPaymentMethods(userId);
        } else {
            await listingRepository.checkAndRevertPreviousListingMethod(userId);
        }

        let data = {
            success: true,
            message: 'Subscription created. Welcome to trajans.market!'
        };

        return helper.sendData(data, res);
    } catch (err) {
        return helper.sendFailureMessage(err, res);
    }
}

async function getPlanByName(req, res, next, planName) {
    try {
        let plan = await subscriptionPlanRepository.getPlanByName(planName);

        if (!plan) {
            let message = 'A problem occured when trying to find the plan details. Please contact the support team ' +
                'for more information.';

            let data = {
                success: false,
                error: message
            };

            return helper.sendData(data, res);
        }

        return helper.sendData(plan, res);
    } catch (err) {
        return helper.sendFailureMessage(err, res);
    }
}

async function cancelSubscription(req, res) {
    try {
        let userId = req.user._id;

        let user = await userRepository.updateUserSubscriptionPlan(userId, undefined, 'Cancelled');

        if (!user) {
            let message = `Error cancelling subscription for user: ${req.user.username} please contact our support team...`;

            let data = {
                success: false,
                error: message
            };

            return helper.sendData(data, res);
        }

        let data = {
            success: true,
            message: 'Subscription successfully cancelled.'
        };

        return helper.sendData(data, res);
    } catch (err) {
        return helper.sendFailureMessage(err, res);
    }
}

async function getAllSubscriptionPlans(req, res) {
    let plans = await subscriptionPlanRepository.getAllSubscriptionPlans();

    if (_.isEmpty(plans)) return console.log('No plans could be found');

    return helper.sendData(plans, res);
}

async function createFeaturedSubscription(req, res) {
    try {
        let data = {};
        let userId = req.user._id;

        let featured = await featuredRepository.getFeaturedSubscriptionForUser(userId);

        if (featured) {
            let activeOrPartial = featured.status === constants.featuredStatuses.active ||
                featured.status === constants.featuredStatuses.partiallyPaid;

            data = {
                activeOrPartial: activeOrPartial,
                success: true,
                featured: featured
            };
        } else {
            let keys = await hdKeyRepository.getHdKeys();

            if (_.isEmpty(keys)) throw new Error('No HD keys found.');

            let rate: any = await getRate();

            let key = _.first(keys);

            await hdKeyRepository.increaseKeyTotalAddresses(key);

            let hdPublicKey = new bitcore.HDPublicKey(key.hdPublicKey);

            let derivedAddress = new bitcore.Address(hdPublicKey.derive(key.totalAddressesCreated).publicKey);

            let amount = (constants.featuredMerchantCost / (rate / 100)).toFixed(8);

            let newFeatured = await featuredRepository.createNewFeature(derivedAddress, userId, amount);

            data = {
                activeOrPartial: false,
                success: true,
                featured: newFeatured
            };
        }

        helper.sendData(data, res);
    } catch (err) {
        helper.sendFailureMessage(err, res);
    }
}

//helper methods

function sendSubscriptionConfirmationEmail(user, planGroup) {
    let mergeVars = emailMerges.subscriptionConfirmation(user.firstName, planGroup);

    let mailOptions = {
        user: user,
        recipientEmail: user.email,
        templateName: 'Subscription confirmation (User)',
        merge_vars: mergeVars
    };

    emailService.sendMandrillEmail(mailOptions);
}

function getRate() {
    return new Promise((resolve, reject) => {
        bitcoinService.getRate('AUD').end((err, body) => {
            if (err) return reject(err);

            let rate = body.body.rate;

            return resolve(rate);
        });
    });
}
