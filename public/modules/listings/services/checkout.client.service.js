'use strict';

angular.module('listings').service('CheckoutService', ['toastr', 'Orders', '$rootScope',
    function(toastr, Orders, $rootScope) {

        var checkoutService = {
            step: 0
        };

        checkoutService.next = function() {
            this.step = this.step + 1;
        };

        checkoutService.previous = function() {
            this.step = this.step - 1;
        };

        checkoutService.setStepImplicitly = function(step) {
            this.step = step;
        };

        checkoutService.get = function() {
            return this.getComposition(this.step);
        };

        checkoutService.hasOrder = function(hasOrder) {
            this.doesHaveOrder = hasOrder;
        };

        checkoutService.getComposition = function(step) {
            var id = this.order ? this.order._id : null;
            var compositions = [{
                view: 'modules/listings/views/modal-includes/shipping-option.client.view.html',
                buttonLeft: this.order || this.doesHaveOrder ? 'Cancel Order' : 'Cancel',
                buttonRight: 'Add to basket',
                executeCancel: this.order || this.doesHaveOrder ? 'cancelOrder' : 'cancelModal',
                execute: 'addToBasket'
            }, {
                view: 'modules/listings/views/modal-includes/choose-address.client.view.html',
                buttonLeft: 'Back',
                buttonRight: 'Next',
                execute: 'selectAddress',
                executeCancel: 'goBack',
                showProgress: true,
                currentProgress: 0
            }, {
                view: 'modules/listings/views/modal-includes/transaction-method.client.view.html',
                buttonLeft: 'Back',
                buttonRight: 'Next',
                execute: 'goToSummary',
                executeCancel: 'goBack',
                showProgress: true,
                currentProgress: 1
            }, {
                view: 'modules/listings/views/modal-includes/order-summary.client.view.html',
                buttonLeft: 'Back',
                buttonRight: 'Next',
                execute: this.skipToEnd ? 'skipToEnd' : this.transactionMethodSelected === 'direct' || this.transactionMethodSelected === 'bitpos' ? 'goToDirectPayment' : 'goToModeratedPayment',
                executeCancel: 'goBack',
                showProgress: true,
                currentProgress: 2
            }, {
                view: 'modules/listings/views/modal-includes/enter-bitcoin-address.client.view.html',
                buttonLeft: '',
                buttonRight: 'I have my key',
                execute: 'keyRecieved',
                executeCancel: '',
                showProgress: true,
                currentProgress: 3
            }, {
                view: 'modules/listings/views/modal-includes/pay-bitcoin.client.view.html',
                buttonLeft: 'Cancel Order',
                buttonRight: '',
                execute: '',
                executeCancel: 'cancelOrder',
                showProgress: true,
                currentProgress: 4
            }];
            return compositions[step];
        };

        checkoutService.addToBasket = function($scope, listing, callback) {
            var self = this;
            if (!$scope.authentication.user) {
                $scope.cancelModal();
            } else {
                listing.chosenShippingMethod = $scope.chosenShippingMethod;
                listing.quantity = $scope.quantity;
                var order = new Orders.orderId({
                    order_items: [listing],
                    listingId: listing._id
                });
                $scope.order = angular.copy(order);
                angular.forEach($scope.order.order_items, function(item, key) {
                    delete item.$index;
                });
                if ($scope.quantity <= $scope.quantityAvailable) {
                    $scope.order.$save(function(order) {
                        $scope.orders = Orders.pendingOrders.query();
                        $scope.orders.$promise.then(function(order) {
                            self.order = order[0];
                            callback(order[0], $scope.orders);
                        });
                    }, function(errorResponse) {
                        toastr.error('Whoops something went wrong...');
                    });
                } else {
                    toastr.error('This quantity is not available...');
                }
            }
        };

        checkoutService.deduceAddress = function($scope) {
            if ($scope.user.fullAddress) {
                $scope.order.streetAddress = $scope.user.streetAddress;
                $scope.order.town = $scope.user.town;
                $scope.order.country = $scope.user.country;
                $scope.order.postcode = $scope.user.postcode;
                $scope.order.telephoneNumber = $scope.user.telephoneNumber;
            }
        };

        checkoutService.deduceAddressNew = function($scope) {
            $scope.order.streetAddress = $scope.user.checkoutStreetAddress;
            $scope.order.town = $scope.user.checkoutTown;
            $scope.order.country = $scope.user.checkoutCountry;
            $scope.order.postcode = $scope.user.checkoutPostcode;
            $scope.order.telephoneNumber = $scope.user.checkoutTelephoneNumber;
            $scope.deducedAddress = $scope.order.streetAddress + ', ' + $scope.order.town + ', ' + $scope.order.country + ', ' + $scope.order.postcode;
        };

        checkoutService.transactionMethod = function(transactionMethod) {
            this.transactionMethodSelected = transactionMethod;
        };

        checkoutService.enableSkipToEnd = function() {
            this.skipToEnd = true;
        };

        return checkoutService;
    }
]);