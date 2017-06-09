import * as mongoose from 'mongoose';

let Schema = mongoose.Schema;

let BlogPostSchema = new Schema({
    description: {
        type: String
    },
    title: {
        type: String
    },
    link: {
        type: String
    },
    pubDate: {
        type: String
    }
});

module.exports = mongoose.model('BlogPost', BlogPostSchema);
