import db from '../database/database';

export default {
    updateBlogPosts
};

async function updateBlogPosts(blogPosts) {
    let BlogPost = db.models.BlogPost;

    for (let blogPost of blogPosts) {
        await BlogPost.create(blogPost);
    }
}
