'use strict';

angular.module('core').factory('SupportRequest', ['$resource',
    function($resource) {
        return {
            supportrequest: $resource('/supportrequest')
        };
    }
]);
