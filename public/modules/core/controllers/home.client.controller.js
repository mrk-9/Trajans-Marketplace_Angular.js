'use strict';
/*global WOW:false, Swiper:false, $:false  */
new WOW().init();
angular.module('core').controller('HomeController', ['$scope', '$rootScope', '$location', 'Authentication', 'Categories',
    'Listings', 'Orders', 'Users', 'Admin', '$modal', '$filter', 'Utilities', 'ListingsFactory', 'ImageFactory', 'Uploads',
    'Subscription', 'Search', 'Bitcoin',
    function($scope, $rootScope, $location, Authentication, Categories, Listings, Orders, Users, Admin, $modal, $filter,
             Utilities, ListingsFactory, ImageFactory, Uploads, Subscription, Search, Bitcoin) {
        Utilities.notDashboard();
        Utilities.scrollTop();
        Utilities.showFooter();

        $scope.authentication = Authentication;
        $scope.showPopularListings = true;
        $scope.showFeaturedListings = false;

        $scope.$on('slideFinished', function() {
            var mySwiper = new Swiper('.swiper-container', {
                pagination: '.swiper-pagination',
                mode: 'horizontal',
                calculateHeight: true,
                onSlideClick: function(swiper) {
                    angular.element(swiper.clickedSlide);
                }
            });
        });

        $scope.marketCap = Bitcoin.marketcap.query();

        // related to load more recent listings
        $scope.listings = [];
        $scope.foundListings = 0;
        $scope.search = {
            keyword: '',
            category: ''
        };
        $scope.skip = 0;
        $scope.limit = 10;

        $scope.init = function() {
            $scope.getSiteDefaults();
            $scope.countAllActiveMerchants();
            $scope.countActiveListings();
            $scope.countCompletedTransactions();
            $scope.getListingsByCategory();
        };

        $scope.getSiteDefaults = function() {
            var defaults = Admin.siteDefaults.get({}, function(defaults) {
                $scope.defaults = defaults;
            });
        };

        $scope.countAllActiveMerchants = function() {
            var storeCount = Users.countAllActiveMerchants.query();
            storeCount.$promise.then(function(c) {
                $scope.storeCount = c.count;
            });
        };

        $scope.countActiveListings = function() {
            var listingsCount = Listings.countActive.query();
            listingsCount.$promise.then(function(c) {
                $scope.productCount = c.count;
            });
        };

        $scope.countCompletedTransactions = function() {
            var transactionCount = Orders.countAllComplete.query();

            transactionCount.$promise.then(function(c) {
                $scope.transactionCount = c.count;
            });
        };

        $scope.getListingsByCategory = function() {
            $scope.categories = Categories.categories.query();
            $scope.categories.$promise.then(function(categories) {
                $scope.allCategories = categories;
            });
        };

        $scope.loadMore = function() {
            $scope.skip += $scope.limit;

            $scope.find(true);
        };

        $scope.find = function(loadMore) {
            if (!loadMore) {
                $scope.listings = [];
                $scope.skip = 0;
            }

            var searchQuery = {
                category: $scope.search.category,
                keyword: $scope.search.keyword,
                skip: $scope.skip,
                limit: $scope.limit
            };

            Search.performSearch.query({
                searchQuery: searchQuery
            }).$promise.then(function(data) {
                $scope.foundListings = data.count;

                if (loadMore) {
                    $scope.listings = $scope.listings.concat(data.listings);
                } else {
                    $scope.listings = data.listings;
                }

                setTimeout(function() {
                    $rootScope.$broadcast('masonry.reload');
                    $scope.showSaving($scope.listings);
                    $scope.$apply();
                }, 1000);
            });
        };

        $scope.showLoadBtn = function() {
            return $scope.foundListings > 0 && ($scope.foundListings > $scope.listings.length);
        };

        $scope.findPopular = function() {
            $scope.getPopularListingsMobile = Listings.popularListings.query();
            $scope.getPopularListingsMobile.$promise.then(function(popularListings) {
                $scope.popularListings = popularListings;
                $scope.showSaving(popularListings);
            });
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

        $scope.search = function(keyword) {
            if (keyword) {
                $location.path('/search/' + keyword);
                $scope.searchKeyword = '';
                $scope.searchOverlayShow = false;
                $scope.searchUndefined = false;
            } else {
                $scope.searchUndefined = true;
            }
        };

        $scope.addToBasket = function(listing) {
            ListingsFactory.addToBasket(listing);
        };

        $scope.showPopular = function() {
            $scope.showPopularListings = true;
            $scope.showFeaturedListings = false;
        };

        $scope.showFeatured = function() {
            $scope.showFeaturedListings = true;
            $scope.showPopularListings = false;
        };

        $scope.findFeaturedMerchants = function() {
            $scope.getFeaturedMerchants = Users.featuredMerchants.query();

            $scope.getFeaturedMerchants.$promise.then(function(response) {
                ListingsFactory.getFeaturedListingsForMerchants(response).then(function(merchants) {
                    $scope.featuredMerchants = merchants;
                });
            });
        };

        $scope.getAllPlans = function() {
            $scope.continue = false;
            $scope.allPlans = Subscription.getPlanOptions.query();

            $scope.allPlans.$promise.then(function(plans) {
                $scope.plansReady = true;
                $scope.gotPlans = true;
                $scope.plans = plans;
            });
        };
    }
]);