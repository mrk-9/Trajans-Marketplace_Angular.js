'use strict';

//Listings service used to communicate Listings REST endpoints
angular.module('listings').factory('Listings', ['$resource',
    function($resource) {
        return {
            listing: $resource('listings/:listingId', {
                listingId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                ignoreLoadingBar: true
            }),
            countActive: $resource('/listings/countActive', {}, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: false,
                    ignoreLoadingBar: true
                }
            }),
            images: $resource('/listing/images'),
            changePrimarySrc: $resource('images/changeSrc/:listingIdChangeSrc', {
                listingIdChangeSrc: '@_id'
            }, {
                update: {
                    method: 'PUT',
                    ignoreLoadingBar: true
                }
            }),
            listingsCategoryCount: $resource('listingscount/:category', {
                category: '@category'
            }, {
                query: {
                    method: 'GET',
                    isArray: false
                }
            }),
            userListings: $resource('userlistings', {}, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: true,
                    ignoreLoadingBar: true
                }
            }),
            updateViewCount: $resource('updatelistingviewcount/:listingIdViewCount', {
                listingIdViewCount: '@_id'
            }, {
                update: {
                    method: 'PUT',
                    ignoreLoadingBar: true
                }
            }),
            popularListings: $resource('listingspopular', {}, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: true
                }
            }),
            listingsStatus: $resource('listingstatus', {}, {
                update: {
                    method: 'PUT'
                }
            }),
            listingFeatured: $resource('listingfeatured', {}, {
                update: {
                    method: 'PUT'
                }
            }),
            listingsByCategory: $resource('listingsbycategory', {}, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: true,
                    ignoreLoadingBar: true
                }
            }),
            countries: $resource('/listings/countries', {}, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: true
                }
            })
        };
    }
]);
