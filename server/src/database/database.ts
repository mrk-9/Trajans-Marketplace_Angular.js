import * as mongoose from 'mongoose';
import * as _ from 'lodash';
import config from '../config/config';
import logger from '../services/loggerService';

let db = null;
let models = {
    BlogPost: require('./models/blogpost'),
    Category: require('./models/category'),
    Conversation: require('./models/conversasation'),
    Country: require('./models/country'),
    Escrow: require('./models/escrow'),
    EscrowAudit: require('./models/escrowaudit'),
    Featured: require('./models/featured'),
    HdKey: require('./models/hdkey'),
    Inbox: require('./models/inbox'),
    Listing: require('./models/listing'),
    ListingImage: require('./models/listingimage'),
    MarketCap: require('./models/marketcap'),
    Message: require('./models/message'),
    Order: require('./models/order'),
    PrimaryCategory: require('./models/primaryCategory'),
    Purchase: require('./models/purchase'),
    Review: require('./models/review'),
    SecondaryCategory: require('./models/secondaryCategory'),
    SiteDefault: require('./models/siteDefault'),
    SubscriptionPlan: require('./models/subscriptionPlan'),
    TempUser: require('./models/tempUser'),
    TertiaryCategory: require('./models/tertiatyCategory'),
    Text: require('./models/text'),
    Upload: require('./models/upload'),
    User: require('./models/user')
};

export default {
    init,
    models
}

async function init() {
    mongoose.Promise = Promise;

    let connectionStr = getConnectionString();

    try {
        await mongoose.connect(connectionStr);
    } catch (err) {
        console.error('Could not connect to MongoDB!');
        logger.error(err);
    }
}

function getConnectionString() {
    let result = 'mongodb://';

    if (config.db.username) {
        result += config.db.username + ':' + config.db.password + '@';
    }

    result += config.db.host + ':' + config.db.port + '/' + config.db.name;

    return result;
}
