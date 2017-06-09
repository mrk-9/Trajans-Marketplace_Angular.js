'use strict';

//Setting up route
angular.module('listings').config(['$stateProvider',
	function($stateProvider) {
		// Listings state routing
		$stateProvider.
		state('listListings', {
			url: '/listings/',
			templateUrl: 'modules/listings/views/list-listings.client.view.html'
		}).
		state('createListing', {
			url: '/listings/create',
			templateUrl: 'modules/listings/views/create-listing.client.view.html'
		}).
		state('viewListing', {
			url: '/listings/:listingId',
			templateUrl: 'modules/listings/views/view-listing.client.view.html'
		}).
		state('editListing', {
			url: '/listings/:listingId/edit',
			templateUrl: 'modules/listings/views/edit-listing.client.view.html'
		}).
		state('cropImages', {
			url: '/listings/:listingId/crop',
			templateUrl: 'modules/listings/views/crop-images.client.view.html'
		});
	}
]);