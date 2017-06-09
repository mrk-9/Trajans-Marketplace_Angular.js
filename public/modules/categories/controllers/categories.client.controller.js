'use strict';

// Categories controller
angular.module('categories').controller('CategoriesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Categories',
	function($scope, $stateParams, $location, Authentication, Categories ) {
		$scope.authentication = Authentication;
		// Find a list of Categories
		$scope.find = function() {
			$scope.categories = Categories.query();
		};
	}
]);