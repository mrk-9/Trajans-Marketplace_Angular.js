import * as mongoose from 'mongoose';

let Schema = mongoose.Schema;

let HdKeySchema = new Schema({
    hdPublicKey: {
        type: String
    },
    maxAddresses: {
        type: Number,
        default: 99999999
    },
    totalAddressesCreated: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('HdKey', HdKeySchema);
