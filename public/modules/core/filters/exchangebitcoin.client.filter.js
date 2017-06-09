'use strict';

angular.module('core').filter('exchangebitcoin', ['Utilities', '$rootScope',
    function(Utilities, $rootScope) {
        return function(input) {
            if (input) {
                var price = parseFloat(input);
                var btcPrice = price / parseFloat($rootScope.australianExchangeRate);
                if (btcPrice) {
                    return btcPrice.toFixed(8) + ' BTC';
                } else {
                    return '...';
                }
            } else {
                return '0 BTC';
            }
        };
    }
]);
