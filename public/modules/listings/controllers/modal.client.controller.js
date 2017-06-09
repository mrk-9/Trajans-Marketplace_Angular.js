'use strict';

/*global $:false, stop:false   */
// Listings controller
angular.module('listings').controller('ModalController', ['$scope', '$rootScope', '$modal', '$state', '$modalInstance', '$stateParams', '$location', 'Authentication', 'Listings', 'Categories', 'Orders', 'Menus', 'Bitcoin', 'Search', 'toastr', 'CheckoutService', 'Escrow', 'mySocket', '$interval', 'Countdown', 'moment', '$timeout', '$http', 'listing', 'order', 'skip', 'noKey',
    function($scope, $rootScope, $modal, $state, $modalInstance, $stateParams, $location, Authentication, Listings, Categories, Orders, Menus, Bitcoin, Search, toastr, CheckoutService, Escrow, socket, $interval, Countdown, moment, $timeout, $http, listing, order, skip, noKey) {
        $scope.authentication = Authentication;
        $scope.user = $scope.authentication.user;
        $scope.listing = listing;
        $scope.shippingOptions = listing.shippingOptions;
        $scope.quantityAvailable = listing.quantityAvailable;
        $scope.quantity = 1;
        $scope.showBuyNow = true;
        $scope.transactionMethod = '';
        $scope.enterNewAddress = false;
        $scope.bitcoin = {};
        $scope.email = {};
        $scope.bitcoin.newBitcoinAddress = '';
        $scope.bitcoin.newBitcoinAddressConfirm = '';
        $scope.email.emailAddressConfirm = '';
        $scope.email.emailAddress = '';
        $scope.keySent = true;
        $scope.hasAddress = true;
        $scope.chosenShippingMethod = false;
        CheckoutService.transactionMethod($scope.transactionMethod);

        // DOES THE USER ALREADY HAVE AN ORDER WITH THE SAME SELLER?

        $scope.checkOrder = function(order) {
            return order.status === 'EXPIRED' ? true : false;
        };

        $scope.getAvailablePaymentMethods = function(order) {
            order.offerBuyerProtection = true;
            order.offerBitcoinDirect = true;
            angular.forEach(order.order_items, function(item) {
                if (!item.offerBuyerProtection) {
                    order.offerBuyerProtection = false;
                }
                if (!item.offerBitcoinDirect) {
                    order.offerBitcoinDirect = false;
                }
                if (order.offerBitcoinDirect) {
                    $scope.transactionMethod = 'direct';
                } else {
                    $scope.transactionMethod = 'moderated';
                }
                CheckoutService.transactionMethod($scope.transactionMethod);
            });
        };

        $scope.createCountdown = function() {
            $scope.currentTime = moment();
            $interval(function() {
                $scope.tick();
            }, 1000);
            socket.on('orderExpired', function(res) {
                alert('Order has expired!');
                window.location.reload();
            });
        };

        $scope.tick = function() {
            $scope.currentTime = moment();
            $scope.orderCoundown($scope.order);
        };

        $scope.orderCoundown = function(data) {
            var endDate;
            if ($scope.order.bitposUsed) {
                endDate = moment(data.created).add(10, 'minutes').toDate();
            } else {
                endDate = moment(data.created).add(10, 'minutes').toDate();
            }
            var remainingTime = Countdown.getRemainingTime(endDate);
            var duration = Countdown.duration(remainingTime);
            $scope.countDown = duration.hours + ':' + duration.minutes + ':' + duration.seconds;
        };

        // SOCKET FOR BITPOS
        $scope.bitposSocket = function() {
            socket.emit('joinOrderRoom', {
                orderId: $scope.order._id
            });
            socket.emit('probeBitposOrder', {
                orderId: $scope.order._id
            });
            $scope.stop = $interval(function() {
                if ($scope.order._id) {
                    socket.emit('probeBitposOrder', {
                        orderId: $scope.order._id
                    });
                } else {
                    $scope.stopInterval(stop);
                }
            }, 20000);
            socket.on('bitposOrderStatus', function(res) {
                $scope.order.status = res.bitpos.status;
                $scope.order.bitposBalance = res.balance;
                if ($scope.order.status === 'PAID') {
                    $timeout(function() {
                        $scope.cancelModal();
                        window.location = '/#!/dashboard/buying/' + $scope.order._id;
                    }, 5000);
                }
            });
            socket.on('orderExpired', function(res) {
                alert('Order has expired!');
                window.location.reload();
            });
        };

        // SOCKET FOR BALANCE
        $scope.socketBalance = function() {
            socket.emit('joinOrderRoom', {
                orderId: $scope.order._id
            });
            if ($scope.order && $scope.order.multisigEscrow && ($scope.order.multisigEscrow.status === 'UNPAID' || $scope.order.multisigEscrow.status === 'PARTIALLY PAID')) {
                socket.emit('getAddressBalance', {
                    address: $scope.order.multisigEscrow.escrowAddress,
                    amount: $scope.order.multisigEscrow.amount,
                    orderId: $scope.order._id,
                    escrowId: $scope.order.multisigEscrow._id
                });
                $scope.stop = $interval(function() {
                    if ($scope.order && $scope.order.multisigEscrow && ($scope.order.multisigEscrow.status === 'UNPAID' || $scope.order.multisigEscrow.status === 'PARTIALLY PAID')) {
                        socket.emit('getAddressBalance', {
                            address: $scope.order.multisigEscrow.escrowAddress,
                            amount: $scope.order.multisigEscrow.amount,
                            orderId: $scope.order._id,
                            escrowId: $scope.order.multisigEscrow._id
                        });
                    } else {
                        $scope.stopInterval(stop);
                    }
                }, 20000);
                socket.on('balance', function(res) {
                    $scope.order.multisigEscrow.status = res.paid;
                    $scope.order.status = res.paid;
                    $scope.order.multisigEscrow.balance = res.balance;
                    $scope.utxos = res.utxos;
                    $scope.hasPaid = res.hasPaid;
                    if ($scope.hasPaid === true && !$scope.order.escrowSimple) {
                        var bitcoinEscrowPaid = new Orders.bitcoinEscrowPaid({
                            id: $scope.order._id
                        });
                        bitcoinEscrowPaid.$save();
                    }
                    if ($scope.hasPaid === true) {
                        $timeout(function() {
                            $scope.cancelModal();
                            window.location = '/#!/dashboard/buying/' + $scope.order._id;
                        }, 5000);
                    }
                });
            }
        };

        $scope.chooseAddress = function(valid) {
            $scope.hasAddress = true;
            $scope.keySent = true;
            CheckoutService.deduceAddressNew($scope);
        };

        if (order) {
            if (!$scope.checkOrder(order)) {
                CheckoutService.hasOrder(true);
                $scope.originalOrder = angular.copy(order);
                $scope.orderId = order._id;
                $scope.order = order;
                $scope.getAvailablePaymentMethods(order);
                $scope.hasOrderWithSeller = true;
                $scope.chosenShippingMethod = true;
                if (skip) {
                    if (noKey) {
                        if ($scope.user.fullAddress) {
                            if (!$scope.order.multisigEscrow) {
                                CheckoutService.deduceAddress($scope);
                                CheckoutService.setStepImplicitly(2);
                            } else {
                                CheckoutService.deduceAddress($scope);
                                CheckoutService.setStepImplicitly(4);
                            }
                        } else {
                            $scope.hasAddress = false;
                            $scope.keySent = true;
                            CheckoutService.setStepImplicitly(1);
                        }
                    } else {
                        if ($scope.order.bitposUsed) {
                            $scope.bitposSocket();
                        } else {
                            $scope.socketBalance();
                        }
                        $scope.qrCode = 'https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=' + $scope.order.bitcoin_address;
                        CheckoutService.setStepImplicitly(5);
                        $scope.createCountdown();
                    }

                } else {
                    $scope.step = CheckoutService.setStepImplicitly(0);
                }
                $scope.step = CheckoutService.get();
            } else {
                $scope.order = {};
            }
        } else {
            $scope.step = CheckoutService.setStepImplicitly(0);
            $scope.order = {};
            CheckoutService.hasOrder(false);
            $scope.step = CheckoutService.get();
        }


        // EXECUTIONS
        $scope.execute = function() {
            $scope[$scope.step.execute]();
        };

        $scope.executeCancel = function() {
            $scope[$scope.step.executeCancel]();
        };

        $scope.generateShippingLocation = function(area, country) {
            return area + ', ' + country;
        };

        // ADD TO BASKET
        $scope.changeMethod = function(shipping) {
            shipping.location = $scope.generateShippingLocation(shipping.area.name, shipping.country.countryName);
            $scope.chosenShippingMethod = shipping;
            $scope.priceBTC = parseFloat(listing.priceFiat) / parseFloat($rootScope.australianExchangeRate);
        };

        // GENERAL METHODS
        $scope.quantityChanged = function(quantity) {
            $scope.quantity = quantity;
        };

        $scope.createNewAddress = function() {
            $scope.showAddAddress = true;
            $scope.hasAddress = false;
        };

        $scope.cancelAddAddress = function(valid) {
            $scope.showAddAddress = false;
            if ($scope.user.fullAddress) {
                $scope.hasAddress = true;
            }
        };

        $scope.transactionModerated = function() {
            $scope.transactionMethod = 'moderated';
            CheckoutService.transactionMethod($scope.transactionMethod);
        };

        $scope.transactionDirect = function() {
            if ($scope.order.seller.bitposEnabled) {
                $scope.transactionMethod = 'bitpos';
            } else {
                $scope.transactionMethod = 'direct';
            }
            CheckoutService.transactionMethod($scope.transactionMethod);
        };

        $scope.enterNewAddress = function() {
            $scope.showNewAddress = true;
        };

        $scope.cancelEnterNewAddress = function() {
            $scope.showNewAddress = false;
        };

        $scope.enterNewEmailAddress = function() {
            $scope.showNewEmailAddress = true;
        };

        $scope.cancelEnterNewEmailAddress = function() {
            $scope.showNewEmailAddress = false;
        };

        $scope.copyToClipboard = function() {
            window.prompt('Copy to clipboard: Ctrl+C, Enter', $scope.order.multisigEscrow.escrowAddress);
        };

        $scope.copySuccess = function() {
            toastr.success('Address copied to clipboard.');
        };

        $scope.refreshBalance = function(escrow) {
            var balance;
            balance = new Escrow.getBalance({
                escrowId: $scope.order.multisigEscrow._id,
                user: $scope.user._id
            });
            balance.$query().then(function(response) {
                if (response.success) {
                    $scope.order.multisigEscrow.balance = response.balance;
                    $scope.order.multisigEscrow.status = response.status;
                    toastr.success('Balance for address ' + $scope.order.multisigEscrow.escrowAddress + ' updated!');
                }
            });
        };

        $scope.stopInterval = function(stop) {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };

        // EXECUTION STEPS
        $scope.addToBasket = function() {
            if ($scope.order && $scope.order.bitposUsed) {
                alert('Outstanding order found! please cancel or complete the pending order.');
                $location.path('/dashboard/buying/' + $scope.order._id);
                $scope.cancelModal();
            } else {
                CheckoutService[$scope.step.execute]($scope, listing, function(order, orders) {
                    $rootScope.$broadcast('basketCount', orders.length);
                    $scope.getAvailablePaymentMethods(order);
                    $scope.order = order;
                    $scope.originalOrder = angular.copy(order);
                    $scope.orderId = $scope.order._id;
                    if ($scope.hasOrderWithSeller) {
                        if ($scope.order.multisigEscrow) {
                            $scope.orderChanged = true;
                            if ($scope.order.escrowSimple) {
                                $scope.directOrder(true);
                                CheckoutService.setStepImplicitly(3);
                                CheckoutService.enableSkipToEnd();
                            } else {
                                $scope.generateEscrowAndKey(true);
                                CheckoutService.setStepImplicitly(3);
                            }
                        } else {
                            $scope.keySent = false;
                            if ($scope.user.fullAddress) {
                                CheckoutService.deduceAddress($scope);
                                CheckoutService.setStepImplicitly(4);
                            } else {
                                $scope.hasAddress = false;
                                CheckoutService.setStepImplicitly(1);
                            }
                        }
                    } else {
                        if (!$scope.user.fullAddress) {
                            $scope.hasAddress = false;
                        }
                        CheckoutService.next();
                    }
                    $scope.step = CheckoutService.get();
                });
            }
        };

        $scope.selectAddress = function() {
            if (!$scope.showAddAddress) {
                CheckoutService.deduceAddress($scope);
                CheckoutService.next();
                $scope.step = CheckoutService.get();
                return;
            }
            if ($scope.user.checkoutStreetAddress &&
                $scope.user.checkoutTown &&
                $scope.user.checkoutCountry &&
                $scope.user.checkoutPostcode &&
                $scope.user.checkoutTelephoneNumber) {
                CheckoutService.deduceAddressNew($scope);
                CheckoutService.next();
                $scope.step = CheckoutService.get();
            } else {
                toastr.error('You need to enter your full address...');
            }
        };

        $scope.goToDirectPayment = function() {
            $scope.directPayment = true;
            if ($scope.transactionMethod === 'bitpos') {
                $scope.bitPosCreate();
            } else {
                $scope.directOrder();
            }
        };

        $scope.goToModeratedPayment = function() {
            $scope.keySent = false;
            if ($scope.orderChanged) {
                CheckoutService.setStepImplicitly(5);
                $scope.step = CheckoutService.get();
            } else {
                CheckoutService.setStepImplicitly(4);
                $scope.step = CheckoutService.get();
            }
        };

        $scope.goToSummary = function() {
            $scope.bitcoinAddressValid = false;
            $scope.emailValid = false;
            $scope.originalCostAUD = $scope.originalOrder.totalOverallCostAUD;
            $scope.originalCostBTC = $scope.originalOrder.totalOverallCostBTC;

            $scope.order.totalOverallCostAUD = $scope.originalCostAUD;
            $scope.order.totalOverallCostBTC = $scope.originalCostBTC;

            $scope.order.totalEscrowCostAUD = $scope.order.totalOverallCostAUD;
            $scope.order.totalEscrowCostBTC = $scope.order.totalOverallCostBTC;
            CheckoutService.setStepImplicitly(3);
            $scope.step = CheckoutService.get();
        };

        $scope.keyRecieved = function(valid) {
            if (valid) {
                CheckoutService.next();
                $scope.step = CheckoutService.get();
            } else {
                $scope.validation('keyRecieved');
            }
        };

        $scope.generateEscrowAndKey = function(valid) {
            if (valid) {
                $scope.totalOverallCostBTC = ($scope.order.totalOverallCostBTC) + ($scope.order.totalShippingCostBTC);
                if ($scope.order && !$scope.order.escrowSimple) {
                    $scope.checkoutOrder();
                } else {
                    $scope.directOrder();
                }
            } else {
                $scope.validation('generateEscrowAndKey');
            }
        };

        $scope.validation = function(type) {
            if ($scope.showNewAddress || !$scope.user.walletAddress) {
                if ($scope.bitcoin.newBitcoinAddress === $scope.bitcoin.newBitcoinAddressConfirm) {
                    Bitcoin.validateAddress.save({
                        address: $scope.bitcoin.newBitcoinAddress
                    }).$promise.then(function(res) {
                        if (res.valid) {
                            $scope.bitcoinAddressValid = true;
                            $scope.order.changeAddress = $scope.bitcoin.newBitcoinAddress;
                        } else {
                            toastr.error('Invalid bitcoin address...');
                        }
                    }).then(function() {
                        return $scope.validateEmailAddress(type);
                    });
                } else {
                    toastr.error('Bitcoin addresses do not match...');
                    return $scope.validateEmailAddress(type);
                }
            } else {
                if ($scope.user.walletAddress) {
                    $scope.bitcoinAddressValid = true;
                } else {
                    toastr.error('Please enter a bitcoin address...');
                    $scope.showAddAddress = true;
                }
                return $scope.validateEmailAddress(type);
            }
        };

        $scope.validateEmailAddress = function(type) {
            // Valid email
            if ($scope.showNewEmailAddress) {
                if ($scope.email.emailAddressConfirm && $scope.email.emailAddress) {
                    if ($scope.email.emailAddressConfirm === $scope.email.emailAddress) {
                        if ($scope.validateEmail($scope.email.emailAddress)) {
                            $scope.emailValid = true;
                            $scope.order.userEmail = $scope.email.emailAddress;
                        } else {
                            toastr.error('Invalid email address entered...');
                        }
                    } else {
                        toastr.error('Email addresses do not match...');
                    }
                } else {
                    toastr.error('Please enter an email address...');
                }
            } else {
                if ($scope.user.email) {
                    $scope.emailValid = true;
                } else {
                    toastr.error('Please enter an email address...');
                    $scope.showNewEmailAddress = true;
                }
            }
            if ($scope.bitcoinAddressValid && $scope.emailValid) {
                $scope[type](true);
            }
        };

        // MULTISIG
        $scope.checkoutOrder = function(order) {
            $scope.order.newTotalOverallCostAUD = $scope.order.totalOverallCostAUD + $scope.totalEscrowCostAUD;
            $scope.order.newTotalOverallCostBTC = $scope.order.totalOverallCostBTC + $scope.totalEscrowCostBTC;
            $scope.order.totalEscrowCostAUD = $scope.totalEscrowCostAUD;
            $scope.order.totalEscrowCostBTC = $scope.totalEscrowCostBTC;
            $scope.createBitcoinOrder($scope.order);
        };

        $scope.createBitcoinOrder = function() {
            var escrowOrder = new Orders.bitcoinEscrowOrder($scope.order);
            escrowOrder.$save(function(response) {
                $scope.keySent = true;
                $scope.shouldHaveKey = true;
                $scope.order = response;
                $scope.qrCode = 'https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=' + $scope.order.multisigEscrow.escrowAddress;
                socket.emit('joinOrderRoom', {
                    orderId: $scope.order._id
                });
                $scope.socketBalance();
                $scope.createCountdown();
                $scope.getShapeShiftCurrencies();
            });
        };

        //DIRECT
        $scope.directOrder = function() {
            var directOrder = new Orders.directOrder($scope.order);
            directOrder.$save(function(response) {
                $scope.order = response;
                if ($scope.orderChanged) {
                    CheckoutService.setStepImplicitly(3);
                } else {
                    CheckoutService.setStepImplicitly(5);
                }
                $scope.step = CheckoutService.get();
                $scope.qrCode = 'https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=' + $scope.order.multisigEscrow.escrowAddress;
                $scope.socketBalance();
                $scope.createCountdown();
                $scope.getShapeShiftCurrencies();
            });
        };

        //DIRECT BITPOS
        $scope.bitPosCreate = function() {
            var bitPosOrder = new Orders.bitPosOrder($scope.order);
            bitPosOrder.$save(function(response) {
                if (response.error) {
                    toastr.error('Oops! There was an error creating bitpos order, please contact support.');
                } else {
                    CheckoutService.setStepImplicitly(5);
                    $scope.step = CheckoutService.get();
                    $scope.order = response;
                    $scope.bitposOrder = true;
                    $scope.bitPosOrderLink = 'https://payment.bitpos.me/payment.jsp?orderId=' + $scope.order.bitposEncodedOrderId;
                    $scope.qrCode = 'https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=' + $scope.order.bitcoin_address;
                    $scope.bitposSocket();
                    $scope.createCountdown();
                }
            });
        };

        $scope.getShapeShiftCurrencies = function() {
            $http.get('https://www.shapeshift.io/getcoins').then(function(response) {
                $scope.availableCoins = response.data;
                $scope.coinsLoaded = true;
            });
        };

        $scope.getPaymentAddress = function() {
            $scope.paymentAddressLoading = true;
            $http.post('https://www.shapeshift.io/sendamount', {
                'withdrawal': $scope.order.multisigEscrow.escrowAddress,
                'pair': $scope.chosenCoin.symbol.toLowerCase() + '_btc',
                'amount': $scope.order.multisigEscrow.amount
            }).then(function(response) {
                $scope.shift = response.data.success;
                $scope.paymentAddressLoading = false;
            });
        };

        $scope.coinChosen = function(chosenCoin) {
            $scope.chosenCoin = $scope.availableCoins[chosenCoin];
            $scope.getPaymentAddress();
        };

        $scope.validateEmail = function(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        };

        // FORWARD / BACK
        $scope.goForward = function() {
            CheckoutService.next();
            $scope.step = CheckoutService.get();
        };

        $scope.skipToEnd = function() {
            CheckoutService.setStepImplicitly(5);
            $scope.step = CheckoutService.get();
        };

        $scope.goBack = function() {
            CheckoutService.previous();
            $scope.step = CheckoutService.get();
        };

        // DISMISS THE MODAL
        $scope.cancelModal = function(orderId, reload) {
            CheckoutService.setStepImplicitly(0);
            $modalInstance.dismiss('cancel');
            if (reload) {
                window.location.reload();
            }
        };

        $scope.goToOrderPage = function() {
            $location.path('/dashboard/buying/' + $scope.order._id);
            window.location.reload();
        };

        // CANCEL THE OTHER
        $scope.cancelOrder = function() {
            Orders.orderId.delete({
                orderId: $scope.orderId
            }, function(order) {
                $scope.cancelModal();
            });
        };
    }
]);
