import * as mongoose from 'mongoose';

let Text = mongoose.model('Text');

export default {
    createText
};

async function createText(user, seller, message) {
    let text = new Text();

    text.to = user;
    text.from = seller;
    text.message = message;

    return await text.save();
}