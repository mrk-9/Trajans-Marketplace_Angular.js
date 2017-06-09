'use strict';

//Orders service used to communicate Orders REST endpoints
angular.module('orders').factory('Uuid', ['$resource',
    function($resource) {
        return {
            newUuid: $resource('/uuid', {}, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: false,
                },
                ignoreLoadingBar: true
            }),
        };
    }
]);
