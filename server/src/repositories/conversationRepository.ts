import * as mongoose from 'mongoose';

let Conversation = mongoose.model('Conversation');

export default {
    createConversation
};

async function createConversation(user, seller, subject, type, text) {
    let conversation = new Conversation();

    conversation.to = user;
    conversation.from = seller;
    conversation.subject = subject;
    conversation.messages.push(text);
    conversation.type = type;

    return await conversation.save();
}