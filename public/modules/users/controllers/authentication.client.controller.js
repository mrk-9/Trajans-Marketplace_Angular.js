'use strict';
/*global $:false */
angular.module('users').controller('AuthenticationController', ['$scope', 'toastr', '$rootScope', '$http', '$location', 'Authentication', 'Orders', 'Users', '$window', 'Utilities', '$timeout',
    function($scope, toastr, $rootScope, $http, $location, Authentication, Orders, Users, $window, Utilities, $timeout) {
        Utilities.notDashboard();
        Utilities.scrollTop();
        Utilities.showFooter();
        $scope.authentication = Authentication;
        // If user is signed in then redirect back home
        if ($scope.authentication.user) $location.path('/');
        $scope.signup = function() {
            if (!$scope.authentication.user) $location.path('/signin');
            $http.post('/auth/signup', $scope.credentials).then(function(response) {
                // If successful we assign the response to the global user model
                $scope.authentication.user = response;
                // And redirect to the index page
                $location.path('/dashboard/home');
                $rootScope.$broadcast('reloadHeader', true);
            }, function(response) {
                toastr.error(response.data.message);
            });
        };
        $scope.signin = function() {
            // change username to lower case before login request - usernames should be entirely unique. 
            $scope.credentials.username = $scope.credentials.username.toLowerCase();
            $http.post('/auth/signin', $scope.credentials).then(function(response) {
                // If successful we assign the response to the global user model
                if (response.data.gaMessage) {
                    $scope.twoFactor = response.data.gaMessage.showTwoFactor;
                    toastr.info(response.data.gaMessage.message);
                } else {
                    $scope.authentication.user = response;

                    var user = $scope.authentication.user;
                    // Update login history with date and time
                    var userService = new Users.updateLoginHistory(user);
                    userService.$update({}, function(user) {});
                    //And redirect to the index page
                    setTimeout(function() {
                        $rootScope.$broadcast('loggedIn');
                        $rootScope.$broadcast('reloadHeaderLogin', true);
                    }, 500);

                }
            }, function(response) {
                toastr.error(response.data.message);
            });
        };

        $timeout(function() {
            Utilities.notDashboard();
        }, 500);

    }
]);