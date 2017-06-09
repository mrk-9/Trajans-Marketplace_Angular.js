'use strict';

angular.module('core').controller('MessagingController', ['$scope', '$rootScope', '$stateParams', 'Users', 'Messaging', 'Utilities', '$location', 'user',
    function($scope, $rootScope, $stateParams, Users, Messaging, Utilities, $location, user) {
        if ($location.$$path.match('dashboard')) {
            Utilities.isDashboard();
            Utilities.scrollTop();
            Utilities.hideFooter();
        } else {
            Utilities.notDashboard();
        }

        $scope.user = user;

        if ($scope.user) {
            Users.userId.get({
                userId: $scope.user._id
            }).$promise.then(function(seller) {
                $scope.username = seller.merchantName || seller.username;
            });
        }

        $rootScope.showMessageDetails = false;

        $scope.readMessage = function(id, index) {
            $scope.messageId = id;
            $scope.messageIndex = index;
            $rootScope.showMessageDetails = true;
        };

        $scope.backToMessages = function() {
            $rootScope.showMessageDetails = false;
        };

    }
]);