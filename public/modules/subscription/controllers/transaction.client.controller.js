'use strict';
/*global moment:false, braintree:false */

angular.module('users').controller('TransactionController', ['$scope', '$rootScope', '$stateParams', '$modal',
    '$modalInstance', '$location', '$locale', 'Authentication', 'Subscription', 'Utilities', 'toastr', 'mySocket',
    '$interval', '$timeout', 'Countdown',
    function($scope, $rootScope, $stateParams, $modal, $modalInstance, $location, $locale, Authentication, Subscription,
             Utilities, toastr, socket, $interval, $timeout, Countdown) {
        Utilities.notDashboard();
        Utilities.scrollTop();
        Utilities.showFooter();

        $scope.user = Authentication.user;

        $scope.modalOpen = false;
        $scope.hasPaid = false;
        $scope.qrCode = '';

        $scope.cancelModal = function(reload) {
            $scope.modalOpen = false;

            $modalInstance.dismiss('cancel');

            if (reload) {
                window.location.reload();
            }
        };

        $scope.goToListings = function() {
            $scope.modalOpen = false;

            $modalInstance.dismiss('cancel');

            window.location.reload();

            $location.path('/dashboard/managelistings');
        };

        $scope.init = function() {
            if ($scope.user.featuredMerchant) {
                $location.path('/dashboard/home');
                return;
            }

            $scope.modalOpen = true;

            Subscription.featuredRequest.get().$promise.then(function(response) {
                $scope.featureRequest = response.featured;

                if (response.featured.paymentAddress && response.featured._id) {
                    socket.emit('joinRoom', {id: response.featured._id});

                    $scope.getAddressBalance(response.featured.paymentAddress, response.featured._id);
                }
            });
        };

        $scope.getAddressBalance = function(address, roomId) {
            $scope.createCountdown();

            $scope.qrCode = 'https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=' + address;

            socket.emit('getBalanceFeatured', {
                address: address,
                roomId: roomId,
                userId: $scope.user._id
            });

            $interval(function() {
                socket.emit('getBalanceFeatured', {
                    address: address,
                    roomId: roomId,
                    userId: $scope.user._id
                });
            }, 10000);

            socket.on('balance', function(response) {
                $scope.featuredAddress = response;

                if (response.paid) {
                    socket.emit('leaveRoom', {
                        id: $scope.featureRequest._id
                    });

                    $scope.hasPaid = response.paid;
                }

                if (response.expired) {
                    socket.emit('leaveRoom', {
                        id: $scope.featureRequest._id
                    });

                    $modalInstance.dismiss('cancel');

                    if ($scope.modalOpen) {
                        $modal.open({
                            templateUrl: 'modules/core/views/featured-merchant.client.view.html',
                            controller: 'TransactionController',
                            resolve: {
                                user: function() {
                                    return $scope.user;
                                }
                            }
                        });
                    }
                }
            });
        };

        $scope.createCountdown = function() {
            $scope.currentTime = moment();

            $interval(function() {
                $scope.tick();
            }, 1000);
        };

        $scope.tick = function() {
            $scope.currentTime = moment();

            $scope.orderCoundown($scope.featureRequest);
        };

        $scope.orderCoundown = function(data) {
            var endDate = moment(data.created).add(10, 'minutes').toDate();

            var remainingTime = Countdown.getRemainingTime(endDate);

            var duration = Countdown.duration(remainingTime);

            if (remainingTime < 0) {
                $scope.countDown = 'Payment window expired...';
                $scope.expired = true;
            } else {
                $scope.countDown = duration.minutes + ':' + duration.seconds;
            }
        };

        $scope.copySuccess = function() {
            toastr.success('Address copied to clipboard.');
        };
    }
]);