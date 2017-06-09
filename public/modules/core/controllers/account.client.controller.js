'use strict';
/*global $:false */

angular.module('core').controller('AccountController', ['$scope', '$rootScope', '$location', 'Utilities', 'Authentication', 'Users', 'Subscription', 'Orders', 'Listings', 'Categories', 'Bitcoin', 'Messaging', 'Fa', 'toastr', '$timeout',
    function($scope, $rootScope, $location, Utilities, Authentication, Users, Subscription, Orders, Listings, Categories, Bitcoin, Messaging, Fa, toastr, $timeout) {
        $timeout(function() {
            Utilities.hideFooter();
            Utilities.scrollTop();
            Utilities.isDashboard();
        }, 200);

        $scope.authentication = Authentication;
        $scope.userListings = [];
        $scope.uploadUrl = '/uploaduserimage';

        if ($scope.authentication.user.data) {
            $scope.user = $scope.authentication.user.data;
        } else {
            $scope.user = $scope.authentication.user;
        }
        if (!$scope.user) $location.path('/signin');

        $scope.activeTab = $location.$$path;
        $scope.route = function(route, reditect) {
            if (reditect) {
                window.location = route;
            } else {
                $scope.activeTab = route;
                $location.path(route);
            }
        };
        $rootScope.$on('setAccountRoute', function(event, route) {
            $scope.activeTab = route;
        });
        $scope.toggleCollapsibleMenu = function() {
            $scope.isCollapsed = !$scope.isCollapsed;
        };
        $scope.changePath = function(link) {
            window.location = link;
        };

        $scope.showOrder = true;
        $scope.review = {};
        // Redirect if not signed in

        //Subscription Details
        var details = Subscription.subscription.query();

        details.$promise.then(function(response) {
            $scope.subscriptionDetails = response;
            $scope.subscriptionPlansLoaded = true;
        });


        $scope.userMessages = Messaging.messages.query();
        $scope.userMessages.$promise.then(function(listings) {
            $scope.unreadMessages = 0;
            for (var i = 0; i < $scope.userMessages.length; i++) {
                if (!$scope.userMessages[i].read)
                    $scope.unreadMessages++;
            }
        });

        // Check payment method is created
        $scope.$on('rootPaymentMethodCreated', function(event, value) {
            $scope.PaymentMethodCreated = value;
        });
        //Check user logged in
        if ($scope.user) {
            $scope.orders = Orders.pendingOrders.query();
            $scope.orders.$promise.then(function(orders) {
                $scope.basketCount = orders.length;
                $rootScope.basketCount = orders.length;
            });
            $scope.$on('basketCount', function(event, count) {
                $scope.basketCount = count;
            });
        }

        $scope.listings = Listings.userListings.query();

        $scope.listings.$promise.then(function(listings) {
            $scope.listings = listings;
            $rootScope.completedOrdersBuyer = 0;
            $scope.$watch('bitcoinExchangeRate', function(bitcoinExchangeRate) {
                for (var i = 0; i < $scope.listings.length; i++) {
                    var btcPriceToPay = $scope.listings[i].priceFiat / $rootScope.bitcoinExchangeRate;
                    $scope.listings[i].priceBTC = btcPriceToPay.toFixed(8);
                }
            });

            $scope.featuredCount = 0;
            angular.forEach(listings, function(listing, key) {
                $scope.userListings.push(listing);
                if (listing.isFeatured) {
                    $scope.featuredCount++;
                }
            });
        });

        // get seller orders 
        $scope.getUserSellerOrders = Orders.userSellerOrders.query();
        $scope.getUserSellerOrders.$promise.then(function(sellerOrders) {
            $scope.sellerOrders = sellerOrders;
            $rootScope.completedOrders = 0;
            $rootScope.escrowOrders = 0;
            for (var i = 0; i < sellerOrders.length; i++) {
                if (sellerOrders[i].status === 'COMPLETED')
                    $rootScope.completedOrders++;

                if (sellerOrders[i].status === 'ESCROW PAID')
                    $rootScope.escrowOrders++;
            }
        });

        $scope.toggleActivation = function(listing) {
            var user = $scope.user;
            if (!listing.listingActive) {

                // Add Listing Reference to User
                user.listing = listing;

                // Connect listing to the user by adding it into the userListings field on the user model
                var userService = new Users.addListing(user);
                userService.$update({}, function(user) {});

            } else if (listing.listingActive) {

                var userServiceRemove = new Users.removeListing(user);
                userServiceRemove.$remove({
                    userListingId: listing._id
                }, function(user) {
                    angular.forEach($scope.user.userListings, function(l){
                        if(l._id === listing._id) {
                            $scope.user.userListings.pull(l);
                        }
                    });
                });

                // Remove featured flag
                if (listing.isFeatured) {
                    var listingService = new Listings.listingFeatured({
                        listingId: listing._id,
                        featured: false
                    });

                    listingService.$save(function(response) {
                        $scope.listings = Listings.userListings.query();
                        $scope.listings.$promise.then(function(listings) {
                            $scope.featuredCount = 0;
                            angular.forEach(listings, function(listing) {
                                if (listing.isFeatured) {
                                    $scope.featuredCount++;
                                }
                            });
                        });
                    });
                }
            }
            var listingServiceStatus = new Listings.listingsStatus({
                listingId: listing._id,
                listingActive: !listing.listingActive
            });
            listingServiceStatus.$save(function(response) {
                $scope.listings = Listings.userListings.query();
                $rootScope.completedOrdersBuyer = 0;
                $scope.$watch('bitcoinExchangeRate', function(bitcoinExchangeRate) {
                    for (var i = 0; i < $scope.listings.length; i++) {
                        var btcPriceToPay = $scope.listings[i].priceFiat / $rootScope.bitcoinExchangeRate;
                        $scope.listings[i].priceBTC = btcPriceToPay.toFixed(8);
                    }
                });
            });
        };

        $scope.enableFa = function() {
            $scope.showQrSetup = true;
        };

        $scope.hideFa = function() {
            $scope.showQrSetup = false;
        };

        $scope.tryCreateFa = function(randomNumber, toggle) {
            var fa = new Fa.createFa();
            if (randomNumber) {
                fa.$save({
                    randomCode: randomNumber,
                    toggle: toggle
                }).then(function(data) {
                    if (data.success) {
                        toastr.success(data.message);
                        $scope.user.faEnabled = data.toggle;
                    } else {
                        toastr.error(data.message);
                    }
                });
            }
        };

        //Dropzone config

        $scope.dropZoneConfig = {
            success: function(response) {
                toastr.success('Upload successful!');
                $scope.$apply(function() {
                    $scope.user.profileImage = response.data.location;
                });
            },
            addedfile: function() {
                toastr.info('Uploading profile image...');
            },
            queuecomplete: function() {
                 return;
            }
        };
    }
]);
