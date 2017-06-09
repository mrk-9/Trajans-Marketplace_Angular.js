'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
    function($resource) {
        return {
            userProfile: $resource('users', {}, {
                update: {
                    method: 'PUT'
                }
            }),
            userId: $resource('usersbyid/:userId', {
                userId: '@_id'
            }, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: false
                }
            }),
            username: $resource('usersbyusername/:username', {
                username: '@_username'
            }, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: false
                }
            }),
            countAllActiveMerchants: $resource('users/countAllActive', {}, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: false
                }
            }),
            updateLoginHistory: $resource('users/updateLoginHistory', {}, {
                update: {
                    method: 'PUT',
                    ignoreLoadingBar: true
                }
            }),
            userSearch: $resource('users/locationsearch', {}, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: true
                }
            }),
            addListing: $resource('users/addListing', {}, {
                update: {
                    method: 'PUT',
                    ignoreLoadingBar: true
                }
            }),
            removeListing: $resource('users/removeListing/:userListingId', {
                userListingId: '@_id'
            }, {
                remove: {
                    method: 'DELETE',
                    ignoreLoadingBar: true
                }
            }),
            currentSubscription: $resource('users/currentSubscription/:userId', {}, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: true,
                    ignoreLoadingBar: true
                }
            }),
            featuredMerchants: $resource('users/featuredmerchants', {}, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: true,
                    ignoreLoadingBar: true
                }
            }),
            reviews: $resource('users/reviews/:userIdForReviews', {}, {
                query: {
                    method: 'GET',
                    isArray: true
                }
            }),
            addReview: $resource('users/reviews', {}, {
                update: {
                    method: 'PUT',
                    ignoreLoadingBar: true
                }
            })
        };
    }
]);
