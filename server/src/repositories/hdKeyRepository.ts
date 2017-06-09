import * as mongoose from 'mongoose';

let HdKey = mongoose.model('HdKey');

export default {
    getHdKeys,
    createHdKey,
    updateHdKey,
    increaseKeyTotalAddresses
};

async function getHdKeys() {
    return await HdKey.find();
}

async function createHdKey(key) {
    let hdKey = new HdKey();

    hdKey.hdPublicKey = key.hdPublicKey;

    return await hdKey.save();
}

async function updateHdKey(hdKey, newKey) {
    hdKey.hdPublicKey = newKey.hdPublicKey;
    hdKey.totalAddressesCreated = 0;

    return await hdKey.save();
}

async function increaseKeyTotalAddresses(key) {
    key.totalAddressesCreated += 1;

    return await key.save();
}