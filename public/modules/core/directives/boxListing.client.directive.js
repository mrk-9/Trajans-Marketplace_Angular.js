'use strict';

angular.module('core').directive('boxListing', function($rootScope) {
    return {
        restrict: 'E',
        templateUrl: 'modules/core/directives/boxListing.html',
		link: function($scope, el, attrs) {
		}
    };
});