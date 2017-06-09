import searchController from '../controllers/searchController';
import adminController from '../controllers/adminController';
import bitcoinController from '../controllers/bitcoinController';
import categoryController from '../controllers/categoryController';
import coreController from '../controllers/coreController';
import escrowController from '../controllers/escrowController';
import listingController from '../controllers/listingController';
import messageController from '../controllers/messageController';
import orderController from '../controllers/orderController';
import subscriptionController from '../controllers/subscriptionController';
import uploadController from '../controllers/uploadController';

export default {
    init: initRoutes
};

function initRoutes(app) {
    initSearchRoutes(app);
    initAdminRoutes(app);
    initBitcoinRoutes(app);
    initCategoryRoutes(app);
    initCoreRoutes(app);
    initEscrowRoutes(app);
    initListingRoutes(app);
    initMessageRoutes(app);
    initOrderRoutes(app);
    initSubscriptionRoutes(app);
    initUploadRoutes(app);
    initUserRoutes(app);
}

function initSearchRoutes(app) {
    app.route('/categorysearch/:category')
        .get(searchController.listingsByCategory);

    app.route('/performsearch')
        .get(searchController.performSearch);

    app.route('/searchlistings')
        .get(searchController.searchListings);

    app.param('category', searchController.listingsByCategory);
}

function initAdminRoutes(app) {
    let userController = require('../controllers/userController');

    app.route('/admin/users/')
        .get(userController.requiresLogin, adminController.hasAdminAuthorization, adminController.listUsers);

    app.route('/admin/users/:userAdminId')
        .get(adminController.hasAdminAuthorization, adminController.userByID);

    app.route('/admin/users/documents/')
        .post(adminController.hasAdminAuthorization, adminController.userDocumentsByID);

    app.route('/admin/updateuser')
        .post(userController.requiresLogin, adminController.hasAdminAuthorization, adminController.updateUser);

    app.route('/admin/siteDefaults/')
        .get(adminController.getSiteDefaults);

    app.route('/admin/typewriter/')
        .put(adminController.hasAdminAuthorization, adminController.updateTypewriter);

    app.route('/admin/banner/')
        .put(adminController.updateBannerStyles, adminController.updateBannerStyles);

    app.param('userAdminId', adminController.userByID);

    app.param('userDocId', adminController.userDocumentsByID);
}

function initBitcoinRoutes(app) {
    app.route('/exchangerates')
        .get(bitcoinController.exchangeRates);

    app.route('/validateAddress')
        .post(bitcoinController.validateAddress);

    app.route('/marketcap')
        .get(bitcoinController.marketCap);
}

function initCategoryRoutes(app) {
    app.route('/categories')
        .get(categoryController.getAllCategories);

    app.route('/categories/:categoryId')
        .get(categoryController.getAllCategories);

    app.route('/categories/primarycategory/:primaryCategory')
        .get(categoryController.getPrimaryCategory);

    app.route('/categories/secondarycategory/:secondaryCategory')
        .get(categoryController.getSecondaryCategory);

    app.route('/categories/tertiarycategory/:tertiaryCategory')
        .get(categoryController.getTertiaryCategory);

    app.param('primaryCategory', categoryController.getPrimaryCategory);

    app.param('secondaryCategory', categoryController.getSecondaryCategory);

    app.param('tertiaryCategory', categoryController.getTertiaryCategory);
}

function initCoreRoutes(app) {
    app.route('/')
        .get(coreController.index);

    app.route('/uuid')
        .get(coreController.uuid);

    app.route('/admin')
        .get(adminController.hasAdminAuthorization, coreController.admin);

    app.route('/admin/escrows/:adminEscrowId?')
        .get(adminController.hasAdminAuthorization, coreController.getEscrow);

    app.route('/admin/decodemultisig')
        .post(adminController.hasAdminAuthorization, coreController.decodeMultisig);

    app.route('/admin/releasefunds')
        .post(adminController.hasAdminAuthorization, coreController.releaseFunds);

    app.route('/admin/createhdkey')
        .post(adminController.hasAdminAuthorization, coreController.createHdKey);

    app.route('/admin/gethdkey')
        .get(adminController.hasAdminAuthorization, coreController.getHdKey);

    app.param('adminEscrowId', coreController.escrowById);
}

function initEscrowRoutes(app) {
    let userController = require('../controllers/userController');

    app.route('/escrow')
        .get(userController.requiresLogin, escrowController.getEscrows);

    app.route('/escrows')
        .get(userController.requiresLogin, escrowController.escrowById);

    app.route('/escrowcount')
        .get(userController.requiresLogin, escrowController.countEscrows);

    app.route('/cancelescrow')
        .put(userController.requiresLogin, escrowController.cancelEscrow);

    app.route('/getbalance')
        .get(userController.requiresLogin, escrowController.getBalance);

    app.route('/requestrefund')
        .put(userController.requiresLogin, escrowController.requestRefund);

    app.route('/confirmrefund')
        .put(userController.requiresLogin, escrowController.confirmRefund);

    app.route('/cancelrefund')
        .put(userController.requiresLogin, escrowController.cancelRefund);

    app.route('/signescrow')
        .put(userController.requiresLogin, escrowController.signEscrow);

    app.route('/signandrelease')
        .put(userController.requiresLogin, escrowController.signAndBroadcast);

    app.route('/buyerrecieved')
        .put(userController.requiresLogin, escrowController.buyerRecieved);

    app.route('/sellerrecieved')
        .put(userController.requiresLogin, escrowController.sellerRecieved);

    app.param('multisigEscrowId', escrowController.escrowById);
}

function initListingRoutes(app) {
    let userController = require('../controllers/userController');

    // Listings Routes
    app.route('/listings')
        .get(listingController.list)
        .post(userController.requiresLogin, userController.hasActiveSubscription, listingController.createListing);

    app.route('/listings/countries')
        .get(listingController.getCountriesList);

    app.route('/listings/countActive')
        .get(listingController.countAllActive);

    app.route('/listingspopular')
        .get(listingController.listPopular);

    app.route('/listings/:listingId')
        .get(listingController.getCurrentListing)
        .put(userController.requiresLogin, listingController.hasAuthorization, listingController.updateListing)
        .delete(userController.requiresLogin, listingController.hasAuthorization, listingController.deleteListing);

    app.route('/listingscount/:catAlias')
        .get(listingController.getListingCountForSpecificCategory);

    app.route('/userlistings')
        .get(userController.requiresLogin, listingController.listingsByUserId);

    app.route('/updatelistingviewcount/:listingIdViewCount')
        .put(listingController.updateViewCount);

    app.route('/listingstatus')
        .post(userController.requiresLogin, listingController.toggleActiveStatus);

    app.route('/listingfeatured')
        .post(userController.requiresLogin, listingController.toggleFeatured);

    app.route('/reportlisting')
        .post(userController.requiresLogin, listingController.reportListing);

    app.route('/listing/images')
        .post(userController.requiresLogin, listingController.markPrimaryImage)
        .delete(userController.requiresLogin, listingController.deleteListingImage);

    app.route('/images/changeSrc/:listingIdChangeSrc')
        .put(userController.requiresLogin, listingController.updatePrimaryImageSrc);

    app.param('listingId', listingController.listingByID);

    app.param('listingIdChangeSrc', listingController.updatePrimaryImageSrc);

    app.param('listingIdViewCount', listingController.updateViewCount);

    app.param('catAlias', listingController.getListingCountForSpecificCategory);
}

function initMessageRoutes(app) {
    let userController = require('../controllers/userController');

    app.route('/userMessages')
        .get(userController.requiresLogin, messageController.list);

    app.route('/userMessage/:messageId')
        .get(messageController.read)
        .delete(userController.requiresLogin, messageController.deleteMessage);

    app.route('/sendMessage')
        .post(userController.requiresLogin, messageController.create);

    app.param('messageId', messageController.messageByID);
}

function initOrderRoutes(app) {
    let userController = require('../controllers/userController');

    app.route('/orders')
        .post(userController.requiresLogin, orderController.createOrder);

    app.route('/orders/:orderId')
        .get(userController.requiresLogin, orderController.read)
        .put(userController.requiresLogin, orderController.hasAuthorization, orderController.update)
        .delete(userController.requiresLogin, orderController.hasAuthorization, orderController.deleteOrder);

    app.route('/countAllCompleteOrders')
        .get(orderController.countAllComplete);

    app.route('/userorders')
        .get(userController.requiresLogin, orderController.ordersByUserId);

    app.route('/usersellerorders')
        .get(userController.requiresLogin, orderController.sellerOrdersByUserId);

    app.route('/usersellerorders/completed/:sellerId')
        .get(orderController.countSellerCompletedOrders);

    app.route('/getorders')
        .get(userController.requiresLogin, orderController.getOrders);

    app.route('/pendinguserorders')
        .get(userController.requiresLogin, orderController.pendingOrdersByUserId);

    app.route('/bitcoinescroworder')
        .post(userController.requiresLogin, orderController.BitcoinEscrow);

    app.route('/bitposorder')
        .post(userController.requiresLogin, orderController.BitPosOrder);

    app.route('/directorder')
        .post(userController.requiresLogin, orderController.createDirectOrder);

    app.route('/orderescrowpaid')
        .post(userController.requiresLogin, orderController.OrderEscrowPaid);

    app.route('/orderreleaseescrow/:orderEscrowAddress')
        .put(userController.requiresLogin, orderController.OrderReleaseEscrowFunds);

    app.route('/markordershipped/:shippingOrderId')
        .put(userController.requiresLogin, orderController.markOrderShipped);

    app.route('/markordernotshipped/:shippingNotOrderId')
        .put(userController.requiresLogin, orderController.markOrderNotShipped);

    app.param('orderId', orderController.orderByID);

    app.param('sellerId', orderController.countSellerCompletedOrders);

    app.param('orderEscrowAddress', orderController.OrderReleaseEscrowFunds);

    app.param('shippingOrderId', orderController.markOrderShipped);

    app.param('shippingNotOrderId', orderController.markOrderNotShipped);
}

function initSubscriptionRoutes(app) {
    let userController = require('../controllers/userController');

    app.route('/subscription')
        .get(subscriptionController.getUserSubscription)
        .post(userController.requiresLogin, subscriptionController.createSubscription)
        .delete(userController.requiresLogin, subscriptionController.cancelSubscription);

    app.route('/subscription/planByName/:planName')
        .get(subscriptionController.getPlanByName);

    app.route('/subscriptions')
        .get(subscriptionController.getAllSubscriptionPlans);

    app.route('/subscriptions/create')
        .get(subscriptionController.createFeaturedSubscription);

    app.param('planName', subscriptionController.getPlanByName);
}

function initUploadRoutes(app) {
    let userController = require('../controllers/userController');

    app.route('/upload')
        .post(userController.requiresLogin, uploadController.create);

    app.route('/upload/image/:path')
        .get(userController.requiresLogin, uploadController.syncImageToLocal)
        .delete(userController.requiresLogin, uploadController.deleteImageFromLocal);

    app.route('/upload/removeLocal/:localPath')
        .delete(userController.requiresLogin, uploadController.deleteImageFromLocal);

    app.route('/upload/setCroppedPath')
        .put(userController.requiresLogin, uploadController.setCroppedPath);

    app.route('/uploadhomebanner')
        .post(userController.requiresLogin, uploadController.uploadHomeBanner);

    app.route('/uploaduserimage')
        .post(userController.requiresLogin, uploadController.createUserImage);

    app.route('/uploadprofilebanner')
        .post(userController.requiresLogin, uploadController.createProfileBanner);

    app.route('/uploadDocuments')
        .post(userController.requiresLogin, uploadController.uploadDocuments);

    app.param('path', uploadController.syncImageToLocal);

    app.param('localPath', uploadController.deleteImageFromLocal);
}

function initUserRoutes(app) {
    let passport = require('passport');
    let userController = require('../controllers/userController');

    app.route('/usersbyid/:userId')
        .get(userController.getUser);

    app.route('/usersbyusername/:username')
        .get(userController.findByUsername);

    app.route('/users/me')
        .get(userController.me);

    app.route('/users')
        .put(userController.requiresLogin, userController.changeProfile);

    app.route('/users/accounts')
        .delete(userController.removeOAuthProvider);

    app.route('/users/verify')
        .post(userController.requiresLogin, userController.verifyUser);

    app.route('/users/toggleauthentication')
        .post(userController.requiresLogin, userController.toggleAuthentication);

    app.route('/users/countAllActive')
        .get(userController.countAllActiveMerchants);

    app.route('/users/featuredmerchants/')
        .get(userController.findFeaturedMerchants);

    app.route('/users/currentSubscription/:currentUserId')
        .get(userController.getSubscriptionInfo);

    app.route('/users/addListing')
        .put(userController.requiresLogin, userController.addListingToUser);

    app.route('/users/removeListing/:userListingId')
        .delete(userController.requiresLogin, userController.removeListingFromUser);

    app.route('/users/locationsearch')
        .get(userController.getLocationSearch);

    app.route('/auth/sendverificationemail')
        .post(userController.resendVerificationEmail);

    app.route('/auth/verifyaccount/:token')
        .get(userController.validateEmailVerificationToken);

    app.route('/users/password')
        .post(userController.changePassword);

    app.route('/auth/forgot')
        .post(userController.forgotPassword);

    app.route('/auth/reset/:token')
        .get(userController.validateResetToken);

    app.route('/auth/reset/:token')
        .post(userController.resetPassword);

    app.route('/users')
        .put(userController.requiresLogin, userController.changeProfile);

    app.route('/profile/update/:token')
        .get(userController.update);

    app.route('/auth/signup')
        .post(userController.signUp);

    app.route('/auth/signin')
        .post(userController.signin);

    app.route('/auth/signout')
        .get(userController.signout);

    app.route('/supportrequest')
        .post(userController.requiresLogin, userController.supportRequest);

    app.route('/auth/facebook')
        .get(passport.authenticate('facebook', {scope: ['email']}));

    app.route('/auth/facebook/callback')
        .get(userController.oauthCallback('facebook'));

    app.route('/auth/twitter')
        .get(passport.authenticate('twitter'));

    app.route('/auth/twitter/callback')
        .get(userController.oauthCallback('twitter'));

    app.route('/auth/google').get(passport.authenticate('google', {
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }));

    app.route('/auth/google/callback')
        .get(userController.oauthCallback('google'));

    app.route('/auth/linkedin')
        .get(passport.authenticate('linkedin'));

    app.route('/auth/linkedin/callback')
        .get(userController.oauthCallback('linkedin'));

    app.route('/auth/github')
        .get(passport.authenticate('github'));

    app.route('/auth/github/callback')
        .get(userController.oauthCallback('github'));

    app.route('/users/reviews/:userIdForReviews')
        .get(userController.getReviews);

    app.route('/users/updateLoginHistory')
        .put(userController.requiresLogin, userController.updateLoginHistory);

    app.route('/users/reviews')
        .post(userController.requiresLogin, userController.addReview);

    app.param('userIdForReviews', userController.getReviews);

    app.param('userId', userController.getUser);

    app.param('currentUserId', userController.getSubscriptionInfo);

    app.param('userListingId', userController.removeListingFromUser);

    app.param('username', userController.findByUsername);
}

