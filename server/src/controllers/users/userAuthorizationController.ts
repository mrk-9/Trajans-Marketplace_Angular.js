import * as _ from 'lodash';
import * as mongoose from 'mongoose';

let User = mongoose.model('User');

export default {
	userByID,
	requiresLogin,
	hasAuthorization,
	hasActiveSubscription
};

/**
 * User middleware
 */
function userByID(req, res, next, id) {
	User.findOne({
		_id: id
	}).exec(function(err, user) {
    	console.log(user);
		if (err) return next(err);
		if (!user) return next(new Error('Failed to load User ' + id));
		req.profile = user;
		next();
	});
}

/**
 * Require login routing middleware
 */
function requiresLogin(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.status(401).send({
			message: 'User is not logged in'
		});
	}

	next();
}

/**
 * User authorizations routing middleware
 */
function hasAuthorization(roles) {
	let _this = this;

	return function(req, res, next) {
		_this.requiresLogin(req, res, function() {
			if (_.intersection(req.user.roles, roles).length) {
				return next();
			} else {
				return res.status(403).send({
					message: 'User is not authorized'
				});
			}
		});
	};
}

/**
 * User authorizations routing middleware
 */
function hasActiveSubscription(req, res, next) {
    if (req.user.subscriptionStatus[0] !== 'Cancelled') {
        console.log('User subscription valid');
        return next();

    } else {
        console.log('User not authorized');
        return res.status(403).send({
            message: 'User is not authorized'
        });

    }
}