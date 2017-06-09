'use strict';
/*global $:false */

angular.module('orders').controller('BasketController', ['$scope', '$rootScope', 'Orders', 'Authentication', '$location', 'Bitcoin', 'Users', '$modalStack', 'toastr', 'Utilities', 'ListingsFactory', '$timeout', 'Listings',
    function($scope, $rootScope, Orders, Authentication, $location, Bitcoin, Users, $modalStack, toastr, Utilities, ListingsFactory, $timeout, Listings) {
        Utilities.notDashboard();
        Utilities.scrollTop();
        $scope.user = Authentication.user;
        $modalStack.dismissAll();
        if (!$scope.user) $location.path('/signin');
        $scope.dataLoaded = false;
        $scope.getOrders = function() {
            $timeout(function() {
                $scope.dataLoaded = true;
                $scope.orders = Orders.orderId;
                $scope.getPendingOrders = Orders.pendingOrders.query();
                $scope.bitcoinEscrowOrder = Orders.bitcoinEscrowOrder;
                $scope.continued = false;
                $scope.getPendingOrders.$promise.then(function(orders) {
                    $scope.userOrders = orders;
                });
            }, 500);

        };

        $scope.$on('currencySymbol', function(a, b, c) {
            $scope.currencySymbol = $rootScope.currencySymbol;
        });

        $scope.remove = function(order, index) {
            Orders.orderId.delete({
                orderId: order._id
            }, function(order) {
                $scope.userOrders.splice(index, 1);
                $rootScope.$broadcast('basketCount', $scope.userOrders.length);
            });
        };

        $scope.$on('basketCount', function(event, count) {
            $scope.basketCount = count;
        });

        $scope.continue = function(order) {
            $scope.continued = true;
            $scope.order = order;
            $scope.totalEscrowCostAUD = $scope.order.totalOverallCostAUD / 100 * 1;
            $scope.totalEscrowCostBTC = $scope.order.totalOverallCostBTC / 100 * 1;
            $scope.totalOverallCostBTC = ($scope.order.totalOverallCostBTC) + ($scope.order.totalShippingCostBTC);
        };

        $scope.cancelContinue = function() {
            $scope.continued = false;
        };

        $scope.escrow = function() {
            $scope.checkoutMethod = 'escrow';
        };

        $scope.bitpos = function() {
            $scope.checkoutMethod = 'bitpos';
        };

        $scope.checkoutOrder = function(order) {
            $scope.order.streetAddress = $scope.user.streetAddress;
            $scope.order.town = $scope.user.town;
            $scope.order.city = $scope.user.city;
            $scope.order.country = $scope.user.country;
            $scope.order.postcode = $scope.user.postcode;
            $scope.order.telephoneNumber = $scope.user.telephoneNumber;
            if ($scope.checkoutMethod) {
                $scope.checkoutError = false;
            } else {
                toastr.error('Please choose a checkout method...');
            }
            if ($scope.checkoutForm.$valid) {
                if ($scope.checkoutMethod) {
                    if ($scope.checkoutMethod === 'bitpos') {
                        $scope.bitPosCreate(order);
                    } else {
                        $scope.order.newTotalOverallCostAUD = $scope.calculateTotalAUD($scope.order);
                        $scope.order.newTotalOverallCostBTC = $scope.calculateTotalBTC($scope.order);
                        $scope.order.totalEscrowCostAUD = $scope.totalEscrowCostAUD;
                        $scope.order.totalEscrowCostBTC = $scope.totalEscrowCostBTC;
                        $scope.bitCoinCreate(order);
                    }
                } else {
                    toastr.error('Please choose a checkout method...');
                }
            } else {
                toastr.error('Please fill in all address fields and a telephone number...');
            }
        };

        $scope.calculateTotalAUD = function(order) {
            var total = 0;
            order.order_items.forEach(function(item) {
                total += item.priceFiat;
            });
            return total;
        };

        $scope.calculateTotalBTC = function(order) {
            var total = 0;
            order.order_items.forEach(function(item) {
                total += item.priceFiat;
            });
            return total;
        };

        $scope.bitPosCreate = function() {
            var bitPosOrder = new Orders.bitPosOrder($scope.order);
            bitPosOrder.$save(function(response) {
                if (response.error) {
                    alert('Oops! There was an error creating bitpos order, please contact support.');
                } else {
                    $rootScope.$broadcast('basketCount', $scope.userOrders.length - 1);
                    $location.path('/dashboard/buying/' + response._id);
                }
            });
        };

        $scope.openBasket = function(order) {
            if (!order.listing) {
                var listing = Listings.listing(order.listingId).get({
                    listingId: order.listingId
                });
                listing.$promise.then(function(listing) {
                    order.listing = listing;
                    ListingsFactory.addToBasket(order.listing, true);
                });
            } else {
                ListingsFactory.addToBasket(order.listing, true);
            }
        };

        $scope.openBasketNoKey = function(order) {
            ListingsFactory.addToBasket(order.listing, true, true);
        };

        $scope.bitCoinCreate = function() {
            var escrowOrder = new Orders.bitcoinEscrowOrder($scope.order);
            escrowOrder.$save(function(response) {
                $location.path('/dashboard/buying/' + response._id);
            });
        };
        $scope.getLocation = function(value) {
            return Users.userSearch.query({
                location: value
            }).$promise.then(function(res) {
                return res;
            });
        };
    }
]);