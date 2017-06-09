'use strict';

angular.module('subscription').factory('Subscription', ['$resource',
    function($resource) {
        return {
            subscription: $resource('subscription', {}, {
                query: { method: 'GET', params: {}, isArray: false, ignoreLoadingBar: true }
            }),
            getPlanOptions: $resource('subscriptions', {}, {
                query: { method: 'GET', params: {}, isArray: true, ignoreLoadingBar: true }
            }),
            getPlanByName: $resource('subscription/planByName/:planName', {
                planName: '@_name'
            }, {
                query: { method: 'GET', params: {}, isArray: false, ignoreLoadingBar: true }
            }),
            featuredRequest: $resource('subscriptions/create', {}, {
                query: { method: 'GET', params: {}, isArray: false, ignoreLoadingBar: true }
            }),
            transaction: $resource('transaction', {}, {
                query: { method: 'GET', params: {}, isArray: false, ignoreLoadingBar: true }
            })
        };
    }
]);