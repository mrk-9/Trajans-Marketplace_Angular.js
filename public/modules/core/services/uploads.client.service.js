'use strict';

//Listings service used to communicate Listings REST endpoints
angular.module('core').factory('Uploads', ['$resource',
    function($resource) {
        return {
            image: $resource('/upload/setCroppedPath', {}, {
                update: {
                    method: 'PUT'
                },
                ignoreLoadingBar: true
            }),
            downloadImage: $resource('/upload/image/:path', {
                path: '@_path'
            }, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: false
                },
                ignoreLoadingBar: true
            }),
            localImage: $resource('/upload/removeLocal/:localPath', {
                localPath: '@_localPath'
            }, {})
        };
    }
]);
