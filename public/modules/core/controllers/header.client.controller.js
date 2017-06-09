'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$rootScope', 'Authentication', 'Menus', 'Orders', '$location', 'Bitcoin', 'Categories', '$window', '$timeout', 'mySocket', '$interval', 'Utilities', '$modal', 'Broadcaster', '$state',
    function($scope, $rootScope, Authentication, Menus, Orders, $location, Bitcoin, Categories, $window, $timeout, socket, $interval, Utilities, $modal, Broadcaster, $state) {
        var scope = $scope;
        $scope.authentication = Authentication;
        if (Authentication.user.data) {
            $scope.user = $scope.authentication.user.data;
        } else {
            $scope.user = $scope.authentication.user;
        }
        $scope.userFirstName = Authentication.user.firstName;
        $rootScope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');
        $scope.searchOverlayShow = false;
        $scope.categories = Categories.categories.query();
        $scope.hover = false;
        $scope.isLoading = true;

        $scope.init = function() {
            if ($scope.user) {
                $scope.orders = Orders.pendingOrders.query();
                $scope.orders.$promise.then(function(orders) {
                    $scope.basketCount = orders.length;
                });
            }
            $rootScope.currentCurrency = 'AUD';
        };

        $rootScope.$on('priceReady', function() {
            $scope.getRates();
        });

        $scope.getRates = function() {
            var rates = Utilities.getExchangeRate().rates;
            if (rates && rates[$rootScope.currentCurrency.toLowerCase()].spot) {
                scope.isLoading = false;
                $scope.actualExchangeRate = rates[$rootScope.currentCurrency.toLowerCase()].spot;
                $scope.actualExchangeRate = parseFloat($scope.actualExchangeRate).toFixed(2);
                $rootScope.exchangeRate = rates[$rootScope.currentCurrency.toLowerCase()].spot;
                $rootScope.australianExchangeRate = rates.aud.spot;
            } else {
                $timeout(function() {
                    $scope.getRates();
                }, 2000);
            }
        };

        $scope.toggleCollapsibleMenu = function() {
            $scope.searchOverlayShow = false;
            $rootScope.isCollapsed = !$rootScope.isCollapsed;
        };

        $scope.$on('$stateChangeSuccess', function() {
            $rootScope.isCollapsed = false;
        });

        $scope.categoryChanged = function(category) {
            Broadcaster.broadcastCategoryChanged(category);
            $location.path('/search/category/' + Broadcaster.category.alias);
        };

        $rootScope.$on('loggedIn', function() {
            $scope.authentication = Authentication;
            $scope.user = $scope.authentication.user;
            $scope.userFirstName = $scope.user.data.displayName;
            $scope.init();
            Utilities.hideFooter();
            Utilities.scrollTop();
        });

        $rootScope.$on('reloadHeader', function(bool, dashboard) {
            if (bool) {
                $window.location.reload();
            }
        });

        $rootScope.$on('reloadHeaderLogin', function(bool) {
            if (bool) {
                window.location = '/#!/dashboard/home';
                window.location.reload();
            }
        });

        $scope.getNewExchangeRate = function(currency) {
            $scope.hover1 = false;
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
                $rootScope.currentCurrency = currency;
            } else {
                $rootScope.currencySymbol = '$';
                $scope.currencySymbol = '$';
                $rootScope.currentCurrency = 'AUD';
            }

            $scope.getRates();
        };

        $scope.$on('basketCount', function(event, count) {
            $scope.basketCount = count;
        });

        $scope.$on('decrementBasketCount', function() {
            $scope.basketCount = $scope.basketCount - 1;
        });

        $scope.searchOverlay = function() {
            $rootScope.isCollapsed = false;
            $scope.searchOverlayShow = !$scope.searchOverlayShow;
            $scope.searchUndefined = false;
        };

        $scope.search = function(keyword) {
            if (keyword) {
                Broadcaster.broadcastSearchKeyword(keyword);
                $location.path('/search/keyword/' + Broadcaster.keyword);

                $scope.searchKeyword = '';
                $scope.searchOverlayShow = false;
                $scope.searchUndefined = false;
            } else {
                $scope.searchUndefined = true;
            }
        };

        $scope.closeOverlay = function() {
            $scope.searchOverlayShow = false;
            $scope.searchUndefined = false;
        };

        socket.on('purcaseItem', function(res) {
            $scope.randNumber = Math.floor(Math.random() * 59);
            $scope.purchaseListing = res;
            $timeout(function() {
                $scope.closePurchaseNotification();
            }, 10000);
        });

        $scope.closePurchaseNotification = function() {
            $scope.purchaseListing = null;
        };

        $scope.hideCurrencyBox = function() {
            $scope.hover1 = false;
        };

        $scope.changePasswordModal = function(listing) {
            $scope.changeModal = $modal.open({
                templateUrl: 'modules/users/views/settings/change-password.client.view.html',
                controller: 'SettingsController',
                resolve: {}
            });
        };

        $rootScope.$on('closeChangePasswordModal', function() {
            if ($scope.changeModal) {
                $scope.changeModal.dismiss();
            }
        });

    }
]);