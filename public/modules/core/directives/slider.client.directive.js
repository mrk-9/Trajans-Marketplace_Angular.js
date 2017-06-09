'use strict';

angular.module('core').directive('endRepeat', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function() {
                    scope.$emit('slideFinished');
                });
            }
        }
    };
}]);
