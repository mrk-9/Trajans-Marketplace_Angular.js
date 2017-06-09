'use strict';

//Setting up route
angular.module('subscription').config(['$stateProvider',
	function($stateProvider) {
		// Subscription state routing
		$stateProvider.
		state('cancel-subscription', {
			url: '/subscription/cancel',
			templateUrl: 'modules/subscription/views/subscription/cancel-subscription.client.view.html'
		}).
		state('confirm-subscription', {
			url: '/subscription/confirm/priceplan/:priceplan',
			templateUrl: 'modules/subscription/views/subscription/confirm-subscription.client.view.html'
		}).
		state('payment-subscription', {
			url: '/subscription/payment/priceplan/:priceplan',
			templateUrl: 'modules/subscription/views/subscription/payment-subscription.client.view.html'
		}).
		state('change-plan', {
			url: '/subscription/change/priceplan/:priceplan',
			templateUrl: 'modules/subscription/views/subscription/change-plan.client.view.html'
		}).
		state('change-plan-confirm', {
			url: '/subscription/change/confirm/:priceplan',
			templateUrl: 'modules/subscription/views/subscription/confirm-plan-change.client.view.html'
		}).
		state('subscription', {
			url: '/subscription/priceplans',
			templateUrl: 'modules/subscription/views/subscription/subscription.client.view.html'
		});
	}
]);