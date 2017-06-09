'use strict';

angular.module('core').factory('SupportRequest', ['$resource',
    function($resource) {
        return $resource('/supportrequest'); 
    }
]);
