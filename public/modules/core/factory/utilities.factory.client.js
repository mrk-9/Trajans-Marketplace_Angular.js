'use strict';
/*global $:false */

angular.module('core').factory('Utilities', [
    function() {
        var utilitesFactory = {};
        utilitesFactory.filterObject = function(obj) {
            var arr = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (obj[key]) {
                        arr.push(key);
                    }
                }
            }
            return arr;
        };
        utilitesFactory.resetObject = function(obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    obj[key] = false;
                }
            }
            return obj;
        };
        utilitesFactory.notDashboard = function() {
            $('#main-nav').removeClass('dashboard');
        };
        utilitesFactory.isDashboard = function() {
            $('#main-nav').addClass('dashboard');
        };
        utilitesFactory.arrayToObject = function(arr, obj) {
            angular.forEach(arr, function(item) {
                obj[item] = true;
            });
            return obj;
        };
        utilitesFactory.scrollTop = function() {
            $('html, body').animate({
                scrollTop: 0
            }, 100);
        };
        utilitesFactory.hideFooter = function() {
            $('.footer').hide();
        };
        utilitesFactory.showFooter = function() {
            $('.footer').show();
        };
        utilitesFactory.setExchangeRate = function(exchangeRate) {
            this.exchangeRate = exchangeRate;
        };
        utilitesFactory.getExchangeRate = function(exchangeRate) {
            return this.exchangeRate;
        };

        utilitesFactory.getFormattedUserAddress = function(user) {
            var address = '';

            if ($.trim(user.town)) {
                address += user.town + ', ';
            }
            if ($.trim(user.country)) {
                address += user.country;
            }

            return address;
        };

        return utilitesFactory;
    }
]);