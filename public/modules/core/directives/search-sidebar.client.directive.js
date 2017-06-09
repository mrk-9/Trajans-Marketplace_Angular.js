'use strict';

angular.module('core').directive('searchSidebar', function($rootScope) {
    return {
        restrict: 'E',
        templateUrl: 'modules/core/directives/searchSidebar.html'
    };
});