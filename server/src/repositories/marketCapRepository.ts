import * as mongoose from 'mongoose';

let MarketCap = mongoose.model('MarketCap');

export default {
    getMarketCap,
    updateMarketCap,
    createMarketCap
};

async function getMarketCap() {
    return await MarketCap.findOne();
}

async function updateMarketCap(marketCap, btc, alt, total) {
    marketCap.btc = btc;
    marketCap.alt = alt;
    marketCap.total = total;

    return await marketCap.save();
}

async function createMarketCap(btc, alt, total) {
    let marketCap = new MarketCap();

    marketCap.btc = btc;
    marketCap.alt = alt;
    marketCap.total = total;

    return await marketCap.save();
}
