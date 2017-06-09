import * as mongoose from 'mongoose';

let Review = mongoose.model('Review');

export default {
    createReview,
    getAllReviewsForUser
};

async function createReview(reviewData) {
    let review = new Review(reviewData);

    return await review.save();
}

async function getAllReviewsForUser(userId) {
    let query = {
        user: userId
    };

    return await Review.find(query)
        .populate('createdBy', 'username displayName userImageName hasUploadedImage country');
}