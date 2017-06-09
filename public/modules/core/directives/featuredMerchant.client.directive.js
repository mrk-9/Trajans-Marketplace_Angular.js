'use strict';

angular.module('core').directive('featuredMerchant', function($rootScope) {
    return {
        restrict: 'E',
        templateUrl: 'modules/core/directives/featuredMerchant.html'
    };
});