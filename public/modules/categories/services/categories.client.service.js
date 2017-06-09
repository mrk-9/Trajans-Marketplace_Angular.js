'use strict';

//Categories service used to communicate Categories REST endpoints
angular.module('categories').factory('Categories', ['$resource',
    function($resource) {
        return {
            categories: $resource('categories/:categoryId', {
                categoryId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            }),
            primaryCategories: $resource('/categories/primarycategory/:primaryCategory', {
                primaryCategory: '@_id'
            }, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: false
                }
            }),
            secondaryCategories: $resource('/categories/secondarycategory/:secondaryCategory', {
                secondaryCategory: '@_id'
            }, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: false
                }
            }),
            tertiaryCategories: $resource('/categories/tertiarycategory/:tertiaryCategory', {
                tertiaryCategory: '@_id'
            }, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: false
                }
            })
        };
    }
]);
