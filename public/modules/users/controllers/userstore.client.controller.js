'use strict';
/*global $:false */
angular.module('users').controller('UserstoreController', ['$scope', '$rootScope', '$stateParams', 'Users', 'ListingsFactory',
    'Authentication', 'Categories', 'Search', 'Bitcoin', '$location', 'CategoryFactory', 'Orders', '$modal', '$filter',
    'toastr', 'Utilities',
    function($scope, $rootScope, $stateParams, Users, ListingsFactory, Authentication, Categories, Search, Bitcoin, $location,
             CategoryFactory, Orders, $modal, $filter, toastr, Utilities) {
        Utilities.notDashboard();
        Utilities.scrollTop();
        Utilities.showFooter();

        $scope.loggedInUser = Authentication.user;

        $scope.sortOptions = [
            {key: 'priceFiatDesc', title: 'Price High to low'},
            {key: 'priceFiatAsc', title: 'Price Low to high'},
            {key: 'nameAsc', title: 'Product name A-Z'},
            {key: 'nameDesc', title: 'Product name Z-A'},
            {key: 'created', title: 'Recently Added'}
        ];
        $scope.orderBy = $scope.sortOptions[0];

        $scope.listingsReady = false;
        $scope.dataLoaded = false;

        $scope.foundListings = 0;
        $scope.listings = [];
        $scope.keyword = '';
        $scope.minPrice = 0;
        $scope.maxPrice = 0;
        $scope.currency = '';
        $scope.currencySymbol = '$';
        $scope.skip = 0;
        $scope.limit = 24;

        $scope.allCategories = [];
        $scope.category = '';
        $scope.primaryCategories = [];
        $scope.primaryCategory = '';
        $scope.secondaryCategory = '';
        $scope.secondaryCategories = [];
        $scope.itemType = '';
        $scope.tertiaryCategories = [];
        $scope.getTertiary = null;

        $scope.freeShipping = true;
        $scope.standardShipping = true;

        $scope.verifiedMerchant = true;
        $scope.unverifiedMerchant = true;

        $scope.bitcoinDirect = true;
        $scope.moderatedPayment = false;

        $scope.priceSlider = {
            minValue: 0,
            maxValue: 1000,
            options: {
                ceil: 1000,
                floor: 0,
                translate: function(value, sliderId, label) {
                    if (label === 'high' && value === 1000) {
                        return $scope.currencySymbol + value + '+';
                    }

                    return $scope.currencySymbol + value;
                }
            }
        };

        $scope.user = {};
        $scope.sellerRating = 0;

        $scope.initUserStoreCtrl = function() {
            $scope.findUser();

            //get all categories
            Categories.categories.query().$promise.then(function(categories) {
                $scope.allCategories = categories;
            });
        };

        $scope.findUser = function() {
            Users.userId.query({
                userId: $stateParams.userId
            }).$promise.then(function(user) {
                $scope.user = user;

                Orders.totalSellerCompletedOrders.get({
                    sellerId: user._id
                }).$promise.then(function(data) {
                    $scope.user.totalTransactions = data.orderCount;
                });

                $scope.calculateSellerRating(user.sellerRating);

                $scope.mainCategoryChanged(null);
            });
        };

        $scope.calculateSellerRating = function(rating) {
            if (rating.length) {
                var total = rating.reduce(function(previousValue, currentValue) {
                    return previousValue + currentValue;
                });

                $scope.sellerRating = Math.round(total / rating.length);
            }
        };

        $scope.updateKeyword = function(keyword) {
            $scope.keyword = keyword;

            $scope.searchUserListings(false);
        };

        $scope.addToBasket = function(listing) {
            ListingsFactory.addToBasket(listing);
        };

        $scope.profileModal = function(user) {
            var userProfileModal = $modal.open({
                templateUrl: 'modules/users/views/profile/modal-profile.client.view.html',
                controller: 'ModalProfileController',
                resolve: {
                    user: function() {
                        return user;
                    }
                }
            });
        };

        $scope.mainCategoryChanged = function(category) {
            $scope.primaryCategories = null;
            $scope.secondaryCategories = null;
            $scope.tertiaryCategories = null;
            $scope.getTertiary = null;
            $scope.primaryCategory = '';
            $scope.secondaryCategory = '';
            $scope.itemType = '';

            if (!category || category === 'all') {
                $scope.category = '';
            } else {
                $scope.allCategories.forEach(function(foundCategory) {
                    if (foundCategory.alias === category) {
                        $scope.getTertiary = foundCategory.end;
                    }
                });

                $scope.category = category;

                if ($scope.getTertiary) {
                    $scope.getTertiaryCategories(category);
                } else {
                    $scope.getPrimaryCategories(category);
                }
            }

            $scope.searchUserListings(false);
        };

        $scope.getPrimaryCategories = function(category) {
            CategoryFactory.getPrimaryCategories(category)
                .$promise.then(function(data) {
                    $scope.primaryCategories = data.categories;
                    $scope.getTertiary = data.end;
            });
        };

        $scope.primaryCategorySelected = function(category) {
            $scope.primaryCategory = category;
            $scope.secondaryCategories = null;
            $scope.tertiaryCategories = null;
            $scope.secondaryCategory = '';
            $scope.itemType = '';

            if ($scope.getTertiary) {
                $scope.getTertiaryCategories(category);
            } else {
                CategoryFactory.getSecondaryCategories(category)
                    .$promise.then(function(data) {
                    if (data.end) {
                        $scope.getTertiaryCategories(category);
                    } else {
                        $scope.secondaryCategories = data.categories;
                        $scope.getTertiary = data.end;
                    }
                });
            }

            $scope.searchUserListings(false);
        };

        $scope.secondaryCategorySelected = function(category) {
            $scope.secondaryCategory = category;
            $scope.tertiaryCategories = null;
            $scope.itemType = '';

            $scope.getTertiaryCategories(category);

            $scope.searchUserListings(false);
        };

        $scope.getTertiaryCategories = function(category) {
            $scope.getTertiary = null;

            CategoryFactory.getTertiaryCategories(category)
                .$promise.then(function(data) {
                    $scope.tertiaryCategories = data.categories;
            });
        };

        $scope.tertiaryCategorySelected = function(category) {
            $scope.itemType = category;

            $scope.searchUserListings(false);
        };

        $scope.loadMode = function() {
            $scope.skip += $scope.limit;

            $scope.searchUserListings(true);
        };

        $scope.searchUserListings = function(loadMore) {
            $scope.dataLoaded = false;
            $scope.listingsReady = false;

            if (!loadMore) {
                $scope.listings = [];
                $scope.skip = 0;
            }

            var searchQuery = {
                userId: $scope.user._id,
                keyword: $scope.keyword,
                category: $scope.category,
                primaryCategory: $scope.primaryCategory,
                secondaryCategory: $scope.secondaryCategory,
                itemType: $scope.itemType,
                minPrice: $scope.priceSlider.minValue,
                maxPrice: $scope.priceSlider.maxValue,
                currency: $scope.currency,
                freeShipping: $scope.freeShipping,
                standardShipping: $scope.standardShipping,
                offerBitcoinDirect: $scope.bitcoinDirect,
                offerBuyerProtection: $scope.moderatedPayment,
                verifiedMerchant: $scope.verifiedMerchant,
                unverifiedMerchant: $scope.unverifiedMerchant,
                orderBy: $scope.orderBy.key,
                skip: $scope.skip,
                limit: $scope.limit
            };

            Search.searchListings.query({
                searchQuery: searchQuery
            }).$promise.then(function(data) {
                $scope.dataLoaded = true;
                $scope.foundListings = data.count;

                if (loadMore) {
                    $scope.listings = $scope.listings.concat(data.listings);
                } else {
                    $scope.listings = data.listings;
                }

                $scope.showSaving($scope.listings);
                $scope.listingsReady = true;
            });
        };

        $scope.sortListings = function(orderBy) {
            $scope.orderBy = orderBy;

            $scope.searchUserListings(false);
        };

        $scope.showSaving = function(listings) {
            angular.forEach(listings, function(listing) {
                if (listing.oldPriceFiat && listing.oldPriceFiat > listing.priceFiat) {
                    listing.showSaving = true;
                    listing.saving = listing.oldPriceFiat - listing.priceFiat;
                    listing.saving = listing.saving.toFixed(2);
                }
            });
        };

        $scope.showLoadBtn = function() {
            return $scope.listingsReady && $scope.foundListings > 0 && ($scope.foundListings > $scope.listings.length);
        };
    }
]);