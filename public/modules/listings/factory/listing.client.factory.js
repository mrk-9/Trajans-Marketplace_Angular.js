'use strict';

/*global $:false */

// Listings controller
angular.module('listings').factory('ListingsFactory', ['$modal', 'Search', '$rootScope', 'Uploads', '$q', 'Orders',
    'lodash', '$http',
    function($modal, Search, $rootScope, Uploads, $q, Orders, _, $http) {
        var listingFactory = {};

        listingFactory.getRecommendedListings = function(listing) {
            var category = listing.category;
            var search = Search.searchCategory.query({
                category: category
            });
            return search.$promise.then(function(recommendedListings) {

                var btcPriceToPay;
                var count = 0;
                var tenListings = [];

                for (var i = 0; i < recommendedListings.length; i++) {
                    if (recommendedListings[i]._id !== listing._id && count < 10) {
                        tenListings.push(recommendedListings[i]);
                        count++;
                    }
                }

                return tenListings;
            });
        };

        listingFactory.getFeaturedListingsForMerchants = function(merchants) {
            var deferred = $q.defer();

            angular.forEach(merchants, function(merchant) {
                var spaceLeft = 4;
                var activeListings = 0;
                var visibleListings = [];

                angular.forEach(merchant.userListings, function(listing) {
                    if (listing.listingActive) activeListings++;

                    if (listing.isFeatured && spaceLeft > 0) {
                        if (listing.mainFeaturedListing) {
                            visibleListings.unshift(listing);
                        } else {
                            visibleListings.push(listing);
                        }
                        
                        spaceLeft--;
                    }
                });

                if (spaceLeft > 0) {
                    angular.forEach(merchant.userListings, function(listing) {
                        if (!listing.isFeatured && spaceLeft > 0) {
                            visibleListings.push(listing);
                            spaceLeft--;
                        }
                    });
                }

                merchant.activeListings = activeListings;
                merchant.visibleListings = visibleListings;

                deferred.resolve(merchants);
            });

            return deferred.promise;
        };

        listingFactory.getFeatured = function(listings) {
            var spaceLeft = 4;
            var featuredListings = [];

            angular.forEach(listings, function(listing) {
                if (listing.isFeatured && spaceLeft > 0) {
                    if (listing.mainFeaturedListing) {
                        featuredListings.unshift(listing);
                    } else {
                        featuredListings.push(listing);
                    }

                    spaceLeft--;
                }
            });

            if (spaceLeft > 0) {
                angular.forEach(listings, function(listing) {
                    if (!listing.isFeatured && spaceLeft > 0) {
                        featuredListings.push(listing);
                        spaceLeft--;
                    }
                });
            }

            return featuredListings;
        };

        listingFactory.addToBasket = function(listing, skipToEnd, hasKey, escrow) {
            var sellerId = listing.user._id ? listing.user._id : listing.user;
            Orders.pendingOrders.query().$promise.then(function(orders) {
                var order;
                if (!escrow) {
                    order = _.find(orders, function(order) {
                        return order.sellerId === sellerId;
                    });
                } else {
                    order = _.find(orders, function(order) {
                        return order.multisigEscrow._id === escrow;
                    });
                }
                var modalInstance = $modal.open({
                    templateUrl: 'modules/listings/views/add-basket.client.view.html',
                    controller: 'ModalController',
                    resolve: {
                        listing: function() {
                            return listing;
                        },
                        order: function() {
                            return order ? order : false;
                        },
                        skip: function() {
                            return skipToEnd ? true : false;
                        },
                        noKey: function() {
                            return hasKey ? true : false;
                        }
                    }
                }).result.finally(function() {
                    window.location.reload();
                });
            });
        };

        listingFactory.getShippingLocations = function() {
            var locations = [
                'Africa',
                'Asia',
                'Australia',
                'Canada',
                'Europe',
                'India',
                'Isreal',
                'New Zealand',
                'North Amercia',
                'Pakistan',
                'South America',
                'United Kingdom',
                'United States',
                'World wide'
            ];
            return locations;
        };

        listingFactory.removeShippingOptions = function(shippingLocations, shippingOptions) {
            for (var i = 0; i <= shippingLocations.length; i++) {
                if (shippingOptions[i]) {
                    if (shippingOptions[i].location === shippingLocations[i]) {
                        shippingLocations.splice(i, 1);
                    }
                }
            }
            return shippingLocations.sort();
        };
        return listingFactory;
    }
]);