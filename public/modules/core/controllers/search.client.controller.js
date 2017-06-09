'use strict';
/*global $:false */

angular.module('core').controller('SearchController', ['$scope', '$rootScope', '$stateParams', '$routeParams', 'Categories',
    'Search', 'Bitcoin', '$location', 'CategoryFactory', 'Orders', '$modal', '$filter', 'toastr', 'ListingsFactory',
    'Authentication', 'Utilities', '$state', '$timeout', 'Broadcaster',
    function($scope, $rootScope, $stateParams, $routeParams, Categories, Search, Bitcoin, $location, CategoryFactory, Orders,
             $modal, $filter, toastr, ListingsFactory, Authentication, Utilities, $state, $timeout, Broadcaster) {
        Utilities.notDashboard();
        Utilities.scrollTop();
        Utilities.showFooter();

        $scope.authentication = Authentication;
        $scope.user = Authentication.user;

        $scope.sortOptions = [
            {key: 'created', title: 'Recently Added'},
            {key: 'priceFiatDesc', title: 'Price High to low'},
            {key: 'priceFiatAsc', title: 'Price Low to high'},
            {key: 'nameAsc', title: 'Product name A-Z'},
            {key: 'nameDesc', title: 'Product name Z-A'}
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

        $scope.initSearch = function() {
            if ($state.params.price && $state.params.currency) {
                $scope.priceSlider.maxValue = 100;

                $scope.changeCurrencySymbol($state.params.currency);
            }

            if ($state.params.category) {
                $scope.category = $state.params.category;
                $scope.mainCategoryChanged($scope.category);
            }

            if ($state.params.keyword) $scope.keyword = $state.params.keyword;

            //get all categories
            Categories.categories.query().$promise.then(function(categories) {
                $scope.allCategories = categories;
            });

            $scope.searchListings(false);
        };

        $scope.changeCurrencySymbol = function(currency) {
            var currencyMap = {
                'AUD': '$',
                'GBP': '£',
                'NZD': '$',
                'EUR': '€',
                'USD': '$',
                'CAD': '$',
                'CHF': 'Fr',
                'HKD': 'HK$',
                'SGD': 'S$',
                'JPY': '¥'
            };

            if (currency) {
                $rootScope.currencySymbol = currencyMap[currency];
                $scope.currencySymbol = currencyMap[currency];
            } else {
                $rootScope.currencySymbol = '$';
                $scope.currencySymbol = '$';
            }
        };

        $rootScope.$on('categoryChanged', function() {
            $state.params.keyword = null;
            $scope.keyword = '';
            $scope.mainCategoryChanged(Broadcaster.category.alias);
        });

        $rootScope.$on('searchKeyword', function() {
            $state.params.category = null;
            $scope.keyword = Broadcaster.keyword;
            $scope.category = '';

            clearAllCategories();

            $scope.searchListings(false);
        });

        $scope.updateKeyword = function(keyword) {
            $scope.keyword = keyword;

            $scope.searchListings(false);
        };

        $scope.mainCategoryChanged = function(category) {
            clearAllCategories();

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

            $scope.searchListings(false);
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

            $scope.searchListings(false);
        };

        $scope.secondaryCategorySelected = function(category) {
            $scope.secondaryCategory = category;
            $scope.tertiaryCategories = null;
            $scope.itemType = '';

            $scope.getTertiaryCategories(category);

            $scope.searchListings(false);
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

            $scope.searchListings(false);
        };

        $scope.loadMode = function() {
            $scope.skip += $scope.limit;

            $scope.searchListings(true);
        };

        $scope.searchListings = function(loadMore) {
            $scope.dataLoaded = false;
            $scope.listingsReady = false;

            if (!loadMore) {
                $scope.listings = [];
                $scope.skip = 0;
            }

            if ($state.params.price && $state.params.currency) {
                $scope.maxPrice =  $state.params.price;
                $scope.currency = $state.params.currency;
            }

            var searchQuery = {
                keyword: $scope.keyword,
                category: $scope.category,
                primaryCategory: $scope.primaryCategory,
                secondaryCategory: $scope.secondaryCategory,
                itemType: $scope.itemType,
                minPrice: $scope.priceSlider.minValue,
                maxPrice: $scope.priceSlider.maxValue,
                currency: $scope.currency,
                offerBitcoinDirect: $scope.bitcoinDirect,
                offerBuyerProtection: $scope.moderatedPayment,
                freeShipping: $scope.freeShipping,
                standardShipping: $scope.standardShipping,
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

        $scope.addToBasket = function(listing) {
            ListingsFactory.addToBasket(listing);
        };

        $scope.sortListings = function(orderBy) {
            $scope.orderBy = orderBy;

            $scope.searchListings(false);
        };

        $scope.showSaving = function(listings) {
            for (var i = 0; i < listings.length; i++) {
                var listing = listings[i];
                if (listing.oldPriceFiat && listing.oldPriceFiat > listing.priceFiat) {
                    listing.showSaving = true;
                    listing.saving = listing.oldPriceFiat - listing.priceFiat;
                    listing.saving = listing.saving.toFixed(2);
                }
            }
        };

        $scope.showLoadBtn = function() {
            return $scope.listingsReady && $scope.foundListings > 0 && ($scope.foundListings > $scope.listings.length);
        };

        $scope.getDisplayCategory = function() {
            var categoryName = '';

            if ($scope.category) {
                $scope.allCategories.forEach(function(foundCategory) {
                    if (foundCategory.alias === $scope.category) {
                        categoryName = foundCategory.title;
                        return false;
                    }
                });
            }

            return categoryName;
        };

        function clearAllCategories() {
            $scope.primaryCategories = null;
            $scope.secondaryCategories = null;
            $scope.tertiaryCategories = null;
            $scope.getTertiary = null;
            $scope.primaryCategory = '';
            $scope.secondaryCategory = '';
            $scope.itemType = '';
        }
    }
]);