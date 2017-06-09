import * as mongoose from 'mongoose';

let SubscriptionPlan = mongoose.model('SubscriptionPlan');

export default {
    getSubscriptionPlanById,
    getAllSubscriptionPlans,
    getPlanByName
};

async function getSubscriptionPlanById(id) {
    return await SubscriptionPlan.findById(id);
}

async function getAllSubscriptionPlans() {
    return await SubscriptionPlan.find({});
}

async function getPlanByName(name) {
    return await SubscriptionPlan.findOne({name: name});
}

