'use strict';
/*global $:false */

angular.module('users').controller('SettingsController', ['$scope', '$rootScope', '$http', '$location', 'Users', 'Authentication', 'toastr', '$interval', '$timeout', '$stateParams', 'Utilities',
    function($scope, $rootScope, $http, $location, Users, Authentication, toastr, $interval, $timeout, $stateParams, Utilities) {
        $scope.uploadUrl = '/uploadprofilebanner';
        //Utilities.hideFooter();
        //Utilities.scrollTop();
        if ($location.$$path.match('dashboard')) {

            Utilities.isDashboard();
        } else {
            Utilities.notDashboard();
        }
        $scope.authentication = Authentication;
        if ($scope.authentication.user.data) {
            $scope.user = $scope.authentication.user.data;
        } else {
            $scope.user = $scope.authentication.user;
        }
        $scope.confirm = false;
        $scope.walletAddress = $scope.user.walletAddress;
        $rootScope.$broadcast('setAccountRoute', $location.$$path);
        // If user is not signed in then redirect back home
        if (!$scope.user) $location.path('/');
        $scope.master = angular.copy($scope.user);
        // Check if there are additional accounts 
        $scope.hasConnectedAdditionalSocialAccounts = function(provider) {
            for (var i in $scope.user.additionalProvidersData) {
                return true;
            }

            return false;
        };

        // Check if provider is already in use with current user
        $scope.isConnectedSocialAccount = function(provider) {
            return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
        };
        // Remove a user social account
        $scope.removeUserSocialAccount = function(provider) {
            $scope.success = $scope.error = null;

            $http.delete('/users/accounts', {
                params: {
                    provider: provider
                }
            }).success(function(response) {
                // If successful show success message and clear form
                $scope.success = true;
                $scope.user = Authentication.user = response;
            }).error(function(response) {
                toastr.error(response.message);
            });
        };
        // Update PGP
        $scope.updateUserProfile = function(isValid) {
            if (isValid) {
                $scope.success = $scope.error = null;
                $scope.bitcoinAddressError = null;
                var user = new Users.userProfile($scope.user);
                user.$update(function(response) {
                    if (response.error) {
                        toastr.error(response.error);
                    } else {
                        $timeout(function() {
                            $scope.confirm = true;
                        });
                        angular.copy($scope.master, $scope.user);
                        $scope.emailSent = true;
                        Utilities.scrollTop();
                    }
                });
            }
        };
        // Change user password
        $scope.changeUserPassword = function() {
            $scope.success = $scope.error = null;

            $http.post('/users/password', $scope.passwordDetails).success(function(response) {
                // If successful show success message and clear form
                $scope.success = true;
                $scope.passwordDetails = null;
            }).error(function(response) {
                toastr.error(response.message);
            });
        };
        $scope.deleteBanner = function() {
            $scope.user.userBannerName = '';
            $scope.user.hasUploadedBanner = false;
            var user = new Users.userProfile($scope.user);
            user.$update(function(response) {
                $scope.flowFile = false;
            });
        };
        $scope.getLocation = function(value) {
            return Users.userSearch.query({
                location: value
            }).$promise.then(function(res) {
                return res;
            });
        };
        $scope.$on('flow::fileAdded', function(event, $flow, flowFile) {
            $scope.flowFile = true;
            $scope.user.hasUploadedBanner = true;
        });

        //Dropzone banner

        //Dropzone config

        $scope.dropZoneConfig = {
            success: function(response) {
                toastr.success('Upload successful!');
                $scope.$apply(function() {
                    $scope.user.userBannerName = response.data.location;
                });
            },
            addedfile: function() {
                console.log($scope.uploadUrl);
                toastr.info('Uploading profile banner...');
            },
            queuecomplete: function() {
                return;
            }
        };

        $scope.closeChangePasswordModal = function() {
            $rootScope.$broadcast('closeChangePasswordModal');
        };
    }
]);
