'use strict';

//Orders service used to communicate Orders REST endpoints
angular.module('core').factory('Messaging', ['$resource',
    function($resource) {
        return {
            messages: $resource('/userMessages', {}, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: true
                }
            }),
            message: $resource('/userMessage/:messageId', {
                messageId: '@_id'
            }),
            sendMessage: $resource('/sendMessage', {}, {
                update: {
                    method: 'PUT'
                },
                ignoreLoadingBar: true
            }),
        };
    }
]);