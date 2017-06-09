'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider.
        state('support', {
            url: '/support',
            templateUrl: 'modules/core/views/support.client.view.html'
        }).
        state('contactus', {
            url: '/contactus',
            templateUrl: 'modules/core/views/contactus.client.view.html'
        }).
        state('coinjarfaq', {
            url: '/coinjarfaq',
            templateUrl: 'modules/core/views/coinjarfaq.client.view.html'
        }).
        state('reportlisting', {
            url: '/reportlisting/:listingId',
            templateUrl: 'modules/core/views/reportlisting.client.view.html'
        }).
        state('advertising', {
            url: '/advertising',
            templateUrl: 'modules/core/views/advertising.client.view.html'
        }).
        state('memberships', {
            url: '/memberships',
            templateUrl: 'modules/core/views/memberships.client.view.html'
        }).
        state('about', {
            url: '/about',
            templateUrl: 'modules/core/views/about.client.view.html'
        }).
        state('privacypolicy', {
            url: '/privacypolicy',
            templateUrl: 'modules/core/views/privacypolicy.client.view.html'
        }).
        state('termsandconditions', {
            url: '/termsandconditions',
            templateUrl: 'modules/core/views/termsandconditions.client.view.html'
        }).
        state('contactuser', {
            url: '/contactuser/:sellerId/:recipient',
            templateUrl: 'modules/core/views/contactuser.client.view.html'
        }).
        state('invoice', {
            url: '/invoice',
            templateUrl: 'modules/core/views/dashboard-includes/account.invoice.client.view.html'
        }).
        state('search', {
            url: '/search',
            abstract: true,
            templateUrl: 'modules/core/views/search.client.view.html',
            controller: 'SearchController',
        }).
        state('search.keyword', {
            url: '/keyword/:keyword',
            parent: 'search',
            templateUrl: 'modules/core/views/search.client.view.html',
            controller: 'SearchController',
        }).
        state('search.category', {
            url: '/category/:category',
            parent: 'search',
            templateUrl: 'modules/core/views/search.client.view.html',
            controller: 'SearchController'
        }).
        state('search.price', {
            url: '/currency/:currency/price/:price',
            templateUrl: 'modules/core/views/search.client.view.html',
            controller: 'SearchController'
        }).
        state('showcase', {
            url: '/showcase',
            templateUrl: 'modules/core/views/showcase.client.view.html'
        }).
        state('dashboard', {
            url: '/dashboard',
            abstract: true,
            templateUrl: 'modules/core/views/dashboard.client.view.html',
            controller: 'AccountController'
        }).
        state('dashboard.home', {
            url: '/home',
            templateUrl: 'modules/core/views/dashboard-includes/account.home.client.view.html',
            controller: 'AccountController'
        }).
        state('dashboard.addlisting', {
            url: '/addlisting',
            templateUrl: 'modules/core/views/dashboard-includes/account.add-listing.client.view.html',
            controller: 'AccountController'
        }).
        state('dashboard.managelistings', {
            url: '/managelistings',
            templateUrl: 'modules/core/views/dashboard-includes/account.listings.client.view.html',
            controller: 'AccountController'
        }).
        state('dashboard.managelistings.id', {
            url: '/managelistings/:listingId',
            parent: 'dashboard',
            templateUrl: 'modules/listings/views/edit-listing.client.view.html',
            controller: 'ListingsController'
        }).
        state('dashboard.buying', {
            url: '/buying',
            templateUrl: 'modules/core/views/dashboard-includes/account.orders.client.view.html',
            controller: 'AccountOrdersController'
        }).
        state('dashboard.buying.id', {
            url: '/buying/:id',
            parent: 'dashboard',
            templateUrl: 'modules/core/views/dashboard-includes/account.orders.client.view.html',
            controller: 'AccountOrdersController'
        }).
        state('dashboard.selling', {
            url: '/selling',
            parent: 'dashboard',
            templateUrl: 'modules/core/views/dashboard-includes/account.orders.client.view.html',
            controller: 'AccountOrdersController'
        }).
        state('dashboard.selling.id', {
            url: '/selling/:id',
            parent: 'dashboard',
            templateUrl: 'modules/core/views/dashboard-includes/account.orders.client.view.html',
            controller: 'AccountOrdersController'
        }).
        state('dashboard.escrowsbuying', {
            url: '/escrowsbuying',
            templateUrl: 'modules/core/views/dashboard-includes/account.escrows.client.view.html',
            controller: 'AccountEscrowsController'
        }).
        state('dashboard.escrowsselling', {
            url: '/escrowsselling',
            templateUrl: 'modules/core/views/dashboard-includes/account.escrows.client.view.html',
            controller: 'AccountEscrowsController'
        }).
        state('dashboard.escrowsbuying.id', {
            url: '/escrowsbuying/:id',
            parent: 'dashboard',
            templateUrl: 'modules/core/views/dashboard-includes/account.escrows.client.view.html',
            controller: 'AccountEscrowsController'
        }).
        state('dashboard.escrowsselling.id', {
            url: '/escrowsselling/:id',
            parent: 'dashboard',
            templateUrl: 'modules/core/views/dashboard-includes/account.escrows.client.view.html',
            controller: 'AccountEscrowsController'
        }).
        state('dashboard.merchant', {
            url: '/merchant',
            templateUrl: 'modules/core/views/dashboard-includes/account.merchant.client.view.html',
            controller: 'SettingsController'
        }).
        state('dashboard.messages', {
            url: '/messages',
            templateUrl: 'modules/core/views/dashboard-includes/account.messages.client.view.html',
            resolve: {
                user: function() {
                    return null;
                }
            },
            controller: 'MessagingController'
        }).
        state('dashboard.settings', {
            url: '/settings',
            templateUrl: 'modules/core/views/dashboard-includes/account.accounts-settings.client.view.html',
            controller: 'SettingsController'
        }).
        state('dashboard.security', {
            url: '/security',
            templateUrl: 'modules/core/views/dashboard-includes/account.security.client.view.html',
            controller: 'SettingsController'
        }).
        state('dashboard.paymentpreferences', {
            url: '/paymentpreferences',
            templateUrl: 'modules/core/views/dashboard-includes/account.paymentpreferences.client.view.html',
            controller: 'SettingsController'
        }).
        state('dashboard.buyingpreferences', {
            url: '/buyingpreferences',
            templateUrl: 'modules/core/views/dashboard-includes/account.buyingpreferences.client.view.html',
            controller: 'SettingsController'
        }).
        state('dashboard.settings.focus', {
            url: '/settings/:focus',
            templateUrl: 'modules/users/views/settings/edit-profile.client.view.html',
            controller: 'SettingsController'
        }).
        state('dashboard.merchantplans', {
            url: '/merchantplans',
            templateUrl: 'modules/core/views/dashboard-includes/account.plans.client.view.html',
            controller: 'SubscriptionController'
        }).
        state('dashboard.cancel-subscription', {
            url: '/subscription/cancel',
            templateUrl: 'modules/subscription/views/subscription/cancel-subscription.client.view.html',
            controller: 'SubscriptionController'
        }).
        state('dashboard.confirm-subscription', {
            url: '/subscription/confirm/priceplan/:priceplan',
            templateUrl: 'modules/subscription/views/subscription/confirm-subscription.client.view.html',
            controller: 'SubscriptionController'
        }).
        state('dashboard.payment-subscription', {
            url: '/subscription/payment/priceplan/:priceplan',
            templateUrl: 'modules/subscription/views/subscription/payment-subscription.client.view.html',
            controller: 'SubscriptionController'
        }).
        state('dashboard.change-plan', {
            url: '/subscription/change/priceplan/:priceplan',
            templateUrl: 'modules/subscription/views/subscription/change-plan.client.view.html',
            controller: 'SubscriptionController'
        }).
        state('dashboard.change-plan-confirm', {
            url: '/subscription/change/confirm/:priceplan',
            templateUrl: 'modules/subscription/views/subscription/confirm-plan-change.client.view.html',
            controller: 'SubscriptionController'
        }).
        state('home', {
            url: '/',
            templateUrl: 'modules/core/views/home.client.view.html'
        }).
        state('become-merchant', {
            url: '/becomeamerchant',
            templateUrl: 'modules/core/views/become-merchant.client.view.html'
        });
    }
]).run(['Bitcoin', 'Utilities', '$interval', '$rootScope',
    function(Bitcoin, Utilities, $interval, $rootScope) {
        var exchangerate = Bitcoin.exchangeRate.query();
        exchangerate.$promise.then(function(response) {
            Utilities.setExchangeRate(response);
            setTimeout(function(){
                 $rootScope.$broadcast('priceReady');
            }, 1000);
        });
        $interval(function() {
            var exchangerate = Bitcoin.exchangeRate.query();
            exchangerate.$promise.then(function(response) {
                Utilities.setExchangeRate(response);
            });
        }, 30000);
    }
]);
