'use strict';
/*global $:false, stop:false  */
angular.module('core').controller('AccountOrdersController', ['$scope', '$rootScope', '$location', 'Utilities', 'Authentication',
    'Users', 'Subscription', 'Orders', 'Listings', 'Categories', 'Bitcoin', 'Messaging', 'Fa', 'toastr', 'mySocket',
    '$stateParams', '$interval', 'ListingsFactory', 'Escrow', '$timeout', '$modal', 'lodash',
    function($scope, $rootScope, $location, Utilities, Authentication, Users, Subscription, Orders, Listings, Categories,
             Bitcoin, Messaging, Fa, toastr, socket, $stateParams, $interval, ListingsFactory, Escrow, $timeout, $modal, _) {
        Utilities.hideFooter();
        Utilities.scrollTop();
        Utilities.isDashboard();

        $scope.authentication = Authentication;
        $scope.chunk = 4;

        $scope.user = $scope.authentication.user.data ? $scope.authentication.user.data : $scope.authentication.user;

        if (!$scope.user) $location.path('/');

        $scope.activeTab = $location.path();
        $scope.review = {};
        $scope.showOrder = false;
        $scope.orders = [];
        $scope.dataLoaded = false;
        $scope.type = $location.$$path.match('buying') ? 'Buying' : 'Selling';

        if ($scope.type === 'Selling') {
            $rootScope.$broadcast('setAccountRoute', '/dashboard/selling');
        } else {
            $rootScope.$broadcast('setAccountRoute', '/dashboard/buying');
        }

        Orders.getOrders.query({
            type: $scope.type
        }).$promise.then(function(orders) {
            $scope.orders = orders;
            $scope.allOrders = orders;
            $scope.chunkOrders = _.take(orders, $scope.chunk);

            if ($stateParams.id) {
                angular.forEach($scope.orders, function(order) {
                    if (order._id.toString() === $stateParams.id.toString()) {
                        $scope.checkOrder(order);
                        order.viewState = 'details';
                    }
                });

                if (!$scope.order) $scope.showOrders();
            } else {
                if ($scope.orders.length) {
                    $scope.order = $scope.orders[0];
                    $scope.dataLoaded = true;
                    $scope.checkOrder($scope.order);
                    $scope.order.viewState = 'details';
                    
                    _.delay(function() {
                        $scope.setQuery();
                    }, 300);
                } else {
                    $scope.dataLoaded = true;
                }
            }
        });

        $scope.setQuery = function() {
            var lastScrollTop = 0;
            window.addEventListener('scroll', function() {
                var st = window.pageYOffset || document.documentElement.scrollTop;
                if (st > lastScrollTop) {
                    if (window.scrollY + 1000 >= $('.content').height()) {
                        if ($scope.chunkOrders.length < $scope.orders.length) {
                            $scope.chunkOrders = $scope.chunkOrders.concat(_.take($scope.allOrders.slice($scope.chunkOrders.length, $scope.allOrders.length), 4));
                        }
                    }
                }
                lastScrollTop = st;
            }, false);
        };

        $scope.checkOrder = function(order) {
            $timeout(function() {
                $scope.order = order;
                // $('body').animate({
                //     scrollTop: $('#' + order._id).offset().top - 250
                // }, 'slow');
                socket.emit('joinOrderRoom', {
                    orderId: $scope.order._id
                });
                if ($scope.order.bitposUsed) {
                    $scope.bitPosOrder();
                } else {
                    $scope.multisigOrder();
                }

            }, 1000);
        };

        socket.on('orderExpired', function(res) {
            if ($location.path().match('dashboard')) {
                if (res.orderExpired) {
                    angular.forEach($scope.orders, function(order) {
                        if (order._id === res.orderId) {
                            order.open = false;
                            order.status = 'EXPIRED';
                        }
                    });
                }
            }
        });

        $scope.closeAllOrders = function(order) {
            angular.forEach($scope.orders, function(order) {
                order.open = false;
                socket.emit('leaveOrderRoom', {
                    orderId: order._id
                });
            });
        };

        $scope.expandOrder = function(order) {
            angular.forEach($scope.orders, function(o) {
                o.open = false;
                socket.emit('leaveOrderRoom', {
                    orderId: o._id
                });
            });
            order.open = true;
            $scope.order = order;
            $scope.order.viewState = 'details';
            $('body').animate({
                scrollTop: $('#' + order._id).offset().top - 250
            }, 'slow');
            socket.emit('joinOrderRoom', {
                orderId: $scope.order._id
            });
            if ($scope.order.bitposUsed) {
                $scope.bitPosOrder();
            } else {
                $scope.multisigOrder();
            }
        };

        $scope.setViewState = function(order, state) {
            order.viewState = state;
        };

        $scope.closeOrder = function(order) {
            order.open = false;
            socket.emit('leaveOrderRoom', {
                orderId: order._id
            });
        };

        $scope.continueOrder = function(order) {
            ListingsFactory.addToBasket($scope.order.listing, true, null, order.multisigEscrow._id);
        };

        $scope.cancelOrder = function() {
            alert('This order has been cancelled');
            $scope.showOrders();
            $location.search('fail', null);
            $rootScope.$broadcast('basketCount', $scope.orders.length - 1);
        };

        $scope.multisigOrder = function() {
            if ($scope.order && $scope.order.multisigEscrow && $scope.order.multisigEscrow.status === 'UNPAID' && !$scope.order.escrowSimple) {
                socket.emit('getAddressBalance', {
                    address: $scope.order.multisigEscrow.escrowAddress,
                    amount: $scope.order.multisigEscrow.amount,
                    orderId: $scope.order._id,
                    escrowId: $scope.order.multisigEscrow._id
                });
                $scope.stop = $interval(function() {
                    if ($scope.order && $scope.order.multisigEscrow && $scope.order.multisigEscrow.status === 'UNPAID') {
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
                    $scope.hasPaid = res.hasPaid;
                    if ($scope.hasPaid === true) {
                        var bitcoinEscrowPaid = new Orders.bitcoinEscrowPaid({
                            id: $scope.order._id
                        });
                        bitcoinEscrowPaid.$save();
                    }
                });
            }
        };

        $scope.bitPosOrder = function() {
            $scope.bitPosOrderLink = 'https://payment.bitpos.me/payment.jsp?orderId=' + $scope.order.bitposEncodedOrderId;
            $scope.paidBalance = '0';
            $scope.hasPaid = false;
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
            });
        };

        $scope.stopInterval = function(stop) {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };

        $scope.showOrders = function() {
            $scope.showOrder = false;
            if ($scope.type === 'Buying') {
                $location.path('/dashboard/buying');
            } else {
                $location.path('/dashboard/selling');
            }
        };

        $scope.markOrderShipped = function(order) {
            var shippingOrderId = order._id;
            var orderService = new Orders.markOrderShipped();
            orderService.$update({
                shippingOrderId: shippingOrderId
            }, function(order) {
                $scope.order.shippingStatus = 'Shipped';
            }, function(err) {
                console.log(err);
            });
        };

        $scope.markOrderNotShipped = function(order) {
            var shippingNotOrderId = order._id;
            var orderService = new Orders.markOrderNotShipped();
            orderService.$update({
                shippingNotOrderId: shippingNotOrderId
            }, function(order) {
                $scope.order.shippingStatus = 'Not shipped';
            });
        };

        $scope.addReview = function(review) {
            $scope.disableButton = true;

            var reviewObj = new Users.addReview({
                title: review.title,
                description: review.description,
                rating: review.rating,
                orderId: $scope.order._id,
                user: $scope.order.seller._id
            });

            reviewObj.$save().then(function(response) {
                $scope.review = {};
                $scope.order.reviewCompleted = true;
                toastr.success('A review has been left for this merchant');
            });
        };

        $scope.copySuccess = function() {
            toastr.success('Address copied to clipboard.');
        };

        // ESCROW RELATED FUNCTIONS

        $scope.getOrderEscrow = function(order) {
            if (!order.bitposUsed) {
                Escrow.escrowById.query({
                    id: order.multisigEscrow._id
                }).$promise.then(function(response) {
                    if (!response.error && response.data) {
                        $scope.escrow = response.data;
                        $scope.escrowId = $scope.escrow._id;
                        $scope.escrowSelected = true;
                    } else {
                        $location.url('/dashboard/escrows');
                    }
                });
            } else {
                $scope.escrow = null;
                $scope.escrowId = null;
                $scope.escrowSelected = false;
            }
        };

        $scope.refreshBalance = function(escrow) {
            var balance = new Escrow.getBalance({
                escrowId: escrow._id,
                user: $scope.user._id
            });
            balance.$query().then(function(response) {
                if (response.success) {
                    escrow.balance = response.balance;
                    $scope.order.status = response.status;
                    escrow.status = response.status;
                    toastr.success('Balance for address ' + escrow.escrowAddress + ' updated!');
                }
            });
        };

        $scope.cancelEscrow = function(id) {
            $scope.escrowId = id;
            $scope.modal = $modal.open({
                animation: $scope.animationsEnabled,
                scope: $scope,
                templateUrl: 'modules/core/views/dashboard-includes/dashboard-modals/account-cancel-escrow.client.view.html',
            });
        };

        $scope.confirmCancel = function() {
            var escrow = new Escrow.cancelEscrow({
                id: $scope.escrowId,
                user: $scope.user._id,
                orderId: $scope.escrow.order ? $scope.escrow.order._id : null
            });
            escrow.$update().then(function(response) {
                if (response.success) {
                    $scope.escrow.status = 'CANCELLED';
                    $scope.modal.close();
                }
            });
            $rootScope.$broadcast('decrementBasketCount');
        };

        $scope.dontCancel = function() {
            $scope.modal.close();
        };

        $scope.signKey = function(escrow) {
            $scope.escrow = escrow;
            $scope.escrowId = escrow._id;
            $scope.signed = escrow.status === 'SIGNED WITH ONE KEY' ? true : false;
            $scope.modal = $modal.open({
                animation: $scope.animationsEnabled,
                scope: $scope,
                templateUrl: 'modules/core/views/dashboard-includes/dashboard-modals/account-sign.client.modal.view.html',
            });
        };

        $scope.confirmSign = function(privateKey) {
            var escrow = new Escrow.signEscrow({
                id: $scope.escrowId,
                key: privateKey,
                user: $scope.user._id
            });
            escrow.$update().then(function(response) {
                if (response.success) {
                    $scope.escrow.status = response.status;
                    $scope.modal.close();
                    toastr.success('Escrow signed successfully!');
                } else {
                    toastr.warning(response.errors);
                }
            });
        };

        $scope.signAndRelease = function(privateKey) {
            var escrow = new Escrow.signReleaseEscrow({
                id: $scope.escrowId,
                key: privateKey,
                user: $scope.user._id
            });
            escrow.$update().then(function(response) {
                if (response.success) {
                    $scope.escrow.status = response.status;
                    $scope.escrow.txid = response.txid;
                    $scope.modal.close();
                    toastr.success('Escrow signed and released successfully!');
                } else {
                    toastr.warning(response.errors);
                }
            });
        };

        $scope.requestRefund = function(escrow) {
            $scope.escrow = escrow;
            $scope.refund = {};
            $scope.refund.refundAddress = escrow.change;
            $scope.modal = $modal.open({
                animation: $scope.animationsEnabled,
                scope: $scope,
                templateUrl: 'modules/core/views/dashboard-includes/dashboard-modals/account-refund-escrow.client.view.html',
            });
        };

        $scope.cancelRefund = function(escrow) {
            $scope.escrow = escrow;
            var confirmRefund = new Escrow.cancelRefund({
                escrowId: escrow._id
            });
            confirmRefund.$update().then(function(response) {
                if (response.errors) {
                    toastr.warning(response.errors);
                } else {
                    toastr.success('Refund cancelled!  The refund request was cancelled.');
                    escrow.status = 'REFUND CANCELLED';
                    $scope.order.status = 'REFUND CANCELLED';
                    escrow.refundRequested = false;
                    escrow.refundReason = '';
                }
            });
        };

        $scope.confirmRefundRequest = function(escrow) {
            if ($scope.refund.refundReason && $scope.refund.refundAddress) {
                var refund = new Escrow.requestRefund({
                    refundReason: $scope.refund.refundReason,
                    escrowId: escrow._id,
                    refundAddress: $scope.refund.refundAddress
                });
                refund.$update().then(function(response) {
                    if (response.errors) {
                        toastr.warning(response.errors);
                    } else {
                        toastr.success('Refund requested!  Please wait for this to be confirmed by the seller.');
                        $scope.escrow.refundRequested = true;
                        $scope.escrow.refundReason = $scope.refund.refundReason;
                        $scope.escrow.refundAddress = $scope.refund.refundAddress;
                        $scope.escrow.status = 'REFUND REQUESTED';
                        $scope.order.status = 'REFUND REQUESTED';
                        $scope.modal.close();
                    }
                });
            }
        };

        $scope.confirmRefund = function(escrow) {
            $scope.escrow = escrow;
            var confirmRefund = new Escrow.confirmRefund({
                escrowId: escrow._id
            });
            confirmRefund.$update().then(function(response) {
                if (response.errors) {
                    toastr.warning(response.errors);
                } else {
                    toastr.success('Refund approved!  The escrow recipient address has been changed to the refund address.');
                    $scope.escrow.refundRequested = false;
                    $scope.escrow.recipientAddress = escrow.refundAddress;
                    $scope.escrow.status = 'REFUND APPROVED';
                    $scope.order.status = 'REFUND APPROVED';
                }
            });
        };
    }
]);
