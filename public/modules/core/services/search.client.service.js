'use strict';

angular.module('core').factory('Search', ['$resource',
    function($resource) {
        return {
            searchCategory: $resource('categorysearch/:category', {
                category: '@_category'
            }, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: true
                },
                ignoreLoadingBar: true
            }),
            performSearch: $resource('performsearch/', {query : '@_query'}, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: false
                },
                ignoreLoadingBar: true
            }),
            searchListings: $resource('searchlistings/', {query: '@_query'}, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: false
                },
                ignoreLoadingBar: true
            })
        };
    }
]);
