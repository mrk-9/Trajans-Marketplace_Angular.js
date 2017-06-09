'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('users', {
			url: '/users/:userId',
			templateUrl: 'modules/users/views/users.client.view.html'
		}).		
		state('user-dashboard', {
			url: '/user-dashboard',
			templateUrl: 'modules/users/views/user-dashboard.client.view.html'
		}).
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('profile-confirm', {
			url: '/profile/confirm',
			templateUrl: 'modules/users/views/profile/update-profile-confirm.client.view.html'
		}).
        state('profile-success', {
			url: '/profile/update/success',
			templateUrl: 'modules/users/views/profile/update-profile-success.client.view.html'
		}).
            state('update-invalid', {
			url: '/profile/update/invalid',
			templateUrl: 'modules/users/views/profile/update-profile-invalid.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('verification', {
			url: '/settings/verification',
			templateUrl: 'modules/users/views/settings/verification-account.client.view.html'
		}).		
		state('verification/documents', {
			url: '/settings/verification/documents',
			templateUrl: 'modules/users/views/settings/documents-account.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('verifyaccount', {
			url: '/verifyaccount/:token',
			templateUrl: 'modules/users/views/verifyaccount/account-verification-success.client.view.html'
		}).
		state('reset-invalid', {
			url: '/verifyaccount/invalid',
			templateUrl: 'modules/users/views/verifyaccount/account-verification-invalid.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invlaid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		}).
		state('featured-merchant-setup', {
			url: '/featured-merchant/setup/:userId',
			templateUrl: 'modules/users/views/featuredmerchant/featured-merchant-setup.client.view.html'
		});
	}
]);
