import * as mongoose from 'mongoose';
import * as speakeasy from 'speakeasy';
import * as dateFns from 'date-fns';

let User = mongoose.model('User');

export default {
    getUserById,
    createUser,
    getUserByEmail,
    updateUserToken,
    getUserByToken,
    updateUserSubscriptionPlan,
    getUserByNameOrEmail,
    updateResetPasswordToken,
    getUserByResetPasswordToken,
    updateUserPassword,
    countAllActiveMerchants,
    addListingForUser,
    removeUserListing,
    getFeaturedMerchantUsersWithListings,
    getUsersList,
    updateUser,
    getUser,
    updateFeaturedMerchant,
    updateSellerProfileReviewScore
};

const ONE_HOUR = 3600000;

async function getUserById(id) {
    return await User.findById(id);
}

async function createUser(userData) {
    let user = new User(userData);

    if (user.username) {
        user.username = user.username.toLowerCase();
        user.displayName = user.username;
        user.merchantName = user.username;
        user.provider = 'local';
    }

    let googleAuthenticator = speakeasy.generate_key({
        length: 20,
        google_auth_qr: true
    });

    user.faAscii = googleAuthenticator.ascii;
    user.faBase32 = googleAuthenticator.base32;
    user.faQr = googleAuthenticator.google_auth_qr;
    user.faHex = googleAuthenticator.hex;
    user.featuredMerchant = false;

    user.updatePassword();

    return await user.save();
}

async function getUserByEmail(email) {
    return await User.findOne({email: email.toLowerCase()});
}

async function updateUserToken(id, token, isVerifiedEmail) {
    let update = {
        verifyAccountToken: token,
        emailAddressVerified: isVerifiedEmail
    };

    return await User.update({_id: id}, {$set: update});
}

async function getUserByToken(token) {
    return await User.findOne({verifyAccountToken: token});
}

async function updateUserSubscriptionPlan(userId, plan, status) {
    let user = await getUserById(userId);

    user.subscriptionPlan = plan;
    user.subscriptionStatus = status;

    return await user.save();
}

async function getUserByNameOrEmail(userQuery) {
    let query = {
        $or: [
            {username: userQuery},
            {email: userQuery}
        ]
    };

    return await User.findOne(query, '-salt -password');
}

async function updateResetPasswordToken(user, token) {
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + ONE_HOUR;

    return await user.save();
}

async function getUserByResetPasswordToken(token) {
    let query = {
        resetPasswordToken: token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    };

    return await User.findOne(query);
}

async function updateUserPassword(user, password) {
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    user.updatePassword();

    return await user.save();
}

async function countAllActiveMerchants() {
    let query = {
        subscriptionPlan: {$ne: null},
        subscriptionStatus: 'Active'
    };

    return await User.where(query).count();
}

async function addListingForUser(listing) {
    let user = await getUserById(listing.user);

    user.userListings.push(listing._id);
    user.shippingInformation = listing.defaultShippingInformation ? listing.shippingInformation : '';

    return await user.save();
}

async function removeUserListing(userId, listingId) {
    let query = {
        _id: userId
    };

    return await User.findOneAndUpdate(query, {$pull: {userListings: listingId}})
        .populate('userListings');
}

async function getFeaturedMerchantUsersWithListings() {
    let query = {
        featuredMerchant: true,
        userListings: {
            $exists: true
        },
        $where: 'this.userListings.length>3'
    };

    let projection = {
        bitposPassword: 0,
        bitposUsername: 0,
        password: 0,
        provider: 0,
        roles: 0,
        walletAddress: 0,
        walletBalance: 0,
        subscriptionId: 0,
        trialExpiryDate: 0,
        faAscii: 0,
        faBase32: 0,
        faQr: 0,
        faHex: 0,
        faEnabled: 0,
        paymentMethodCreated: 0,
        resetPasswordToken: 0,
        resetPasswordExpires: 0
    };

    return await User.find(query, projection)
        .populate({
            path: 'userListings',
            options: {
                sort: {
                    'created': -1
                },
                $where: 'this.quantityAvailable>0 && this.listingActive'
            }
        });
}

async function getUsersList() {
    return await User.find().sort('-created');
}

async function updateUser(id, user) {
    if (user.featuredMerchant) {
        user.featuredMerchantExpiry = dateFns.addDays(new Date(), 7);
    }

    return await User.findByIdAndUpdate(id, {$set: user}, {new: true});
}

async function getUser(id) {
    let projection = {
        bitposPassword: 0,
        bitposUsername: 0,
        password: 0,
        provider: 0,
        roles: 0,
        walletAddress: 0,
        walletBalance: 0,
        subscriptionId: 0,
        trialExpiryDate: 0,
        faAscii: 0,
        faBase32: 0,
        faQr: 0,
        faHex: 0,
        faEnabled: 0,
        paymentMethodCreated: 0,
        resetPasswordToken: 0,
        resetPasswordExpires: 0
    };

    return await User.findOne({_id: id}, projection);
}

async function updateFeaturedMerchant(id) {
    let update = {
        featuredMerchant: true,
        featuredMerchantExpiry: dateFns.addDays(new Date(), 7)
    };

    return await User.findByIdAndUpdate(id, {$set: update});
}

async function updateSellerProfileReviewScore(id, rating) {
    let user = await getUserById(id);

    user.sellerRating.push(rating);

    return await user.save();
}