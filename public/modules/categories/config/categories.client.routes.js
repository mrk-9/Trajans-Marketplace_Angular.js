'use strict';

//Setting up route
angular.module('categories').config(['$stateProvider',
	function($stateProvider) {
		// Categories state routing
		$stateProvider.
		state('listCategories', {
			url: '/categories',
			templateUrl: 'modules/categories/views/list-categories.client.view.html'
		});
	}
]);