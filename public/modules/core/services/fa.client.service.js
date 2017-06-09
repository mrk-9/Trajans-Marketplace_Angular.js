'use strict';

angular.module('core').factory('Fa', ['$resource',
    function($resource) {
        return {
            createFa: $resource('/users/toggleauthentication/')
        };
    }
]);
