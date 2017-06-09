import * as _ from 'lodash';
import usersAuthentication from './users/userAuthenticationController';
import usersAuthorization from './users/userAuthorizationController';
import usersPassword from './users/userPasswordController';
import usersProfile from './users/userProfileController';

module.exports = _.extend(
	usersAuthentication,
	usersAuthorization,
	usersPassword,
	usersProfile
);
