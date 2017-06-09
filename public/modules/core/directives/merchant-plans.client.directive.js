'use strict';

angular.module('core').directive('merchantPlans', function($rootScope) {
    return {
        restrict: 'E',
        templateUrl: 'modules/core/directives/merchantplans.html'
    };
});