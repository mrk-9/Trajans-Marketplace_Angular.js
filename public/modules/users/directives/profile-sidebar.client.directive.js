'use strict';

angular.module('users').directive('profileSidebar', function($rootScope) {
    return {
        restrict: 'E',
        templateUrl: 'modules/users/directives/profileSidebar.html'
    };
});