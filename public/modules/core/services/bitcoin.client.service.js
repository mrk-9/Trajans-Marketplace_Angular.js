'use strict';

//Orders service used to communicate Orders REST endpoints
angular.module('orders').factory('Bitcoin', ['$resource',
    function($resource) {
        return {
            exchangeRate: $resource('exchangerates', {}, {
                query: {
                    params: {},
                    isArray: false,
                    ignoreLoadingBar: true
                }
            }),
            validateAddress: $resource('validateAddress', {}, {

            }),
            marketcap: $resource('marketcap', {}, {
                query: {
                    params: {},
                    isArray: false,
                    ignoreLoadingBar: true
                }
            })
        };
    }
]);