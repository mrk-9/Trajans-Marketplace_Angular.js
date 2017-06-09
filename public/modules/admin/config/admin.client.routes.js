'use strict';

//Setting up route
angular.module('admin').config(['$stateProvider',
    function($stateProvider) {
        // Admin state routing
        $stateProvider.
        state('admin', {
            url: '/admin',
            templateUrl: 'modules/admin/views/admin.client.view.html'
        }).
        state('editUser', {
            url: '/admin/user/:userAdminId/edit',
            templateUrl: 'modules/admin/views/users/edit-user.client.view.html'
        });
    }
]);
