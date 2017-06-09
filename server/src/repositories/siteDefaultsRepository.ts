import * as mongoose from 'mongoose';

let SiteDefaults = mongoose.model('SiteDefault');

export default {
    getSiteDefaults
};

async function getSiteDefaults() {
    return await SiteDefaults.findOne({});
}