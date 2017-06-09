import * as mongoose from 'mongoose';

export default {
    getList,
    getPrimaryCategoryByAlias,
    getSecondaryCategoryByAlias,
    getTertiaryCategoryByAlias
};

async function getList() {
    let Category = mongoose.model('Category');

    return await Category.find().sort();
}

async function getPrimaryCategoryByAlias(alias) {
    let PrimaryCategory = mongoose.model('PrimaryCategory');

    return await PrimaryCategory.findOne({alias}).sort();
}

async function getSecondaryCategoryByAlias(alias) {
    let SecondaryCategory = mongoose.model('SecondaryCategory');

    return await SecondaryCategory.findOne({alias}).sort();
}

async function getTertiaryCategoryByAlias(alias) {
    let TertiaryCategory = mongoose.model('TertiaryCategory');

    return await TertiaryCategory.findOne({name: alias}).sort();
}