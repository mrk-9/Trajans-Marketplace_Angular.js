'use strict';

angular.module('core').filter('exchange', ['Utilities', '$rootScope',
    function(Utilities, $rootScope) {
        return function(input) {
            if (input) {
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

                if ($rootScope.currentCurrency !== 'AUD') {
                    var price = parseFloat($rootScope.exchangeRate) / parseFloat($rootScope.australianExchangeRate) * input;
                    return currencyMap[$rootScope.currentCurrency] + parseFloat(price).toFixed(2);
                } else {
                    return '$' + parseFloat(input).toFixed(2);
                }
            } else {
                return;
            }
        };
    }
]);
