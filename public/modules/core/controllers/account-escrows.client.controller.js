'use strict';
/*global $:false */

angular.module('core').controller('AccountEscrowsController', ['$scope', '$rootScope', '$location', 'Utilities', 'Authentication', 'Users', 'Subscription', 'Orders', 'Listings', 'Categories', 'Bitcoin', 'Messaging', 'Fa', 'toastr', 'mySocket', 'Escrow', '$stateParams', '$modal',
    function($scope, $rootScope, $location, Utilities, Authentication, Users, Subscription, Orders, Listings, Categories, Bitcoin, Messaging, Fa, toastr, socket, Escrow, $stateParams, $modal) {
        Utilities.hideFooter();
        Utilities.scrollTop();
        Utilities.isDashboard();
        $scope.dataLoaded = false;
        $scope.authentication = Authentication;
        if ($scope.authentication.user.data) {
            $scope.user = $scope.authentication.user.data;
        } else {
            $scope.user = $scope.authentication.user;
        }
        if (!$scope.user) $location.path('/');
        $scope.type = $location.$$path.match('buying') ? 'buying' : 'selling';
        $scope.escrows = [];
        if ($stateParams.id) {
            Escrow.escrowById.query({
                id: $stateParams.id
            }).$promise.then(function(response) {
                if (!response.error && response.data) {
                    $scope.escrow = response.data;
                    $scope.escrowId = $scope.escrow._id;
                    $scope.escrowSelected = true;
                    $scope.dataLoaded = true;
                } else {
                    $location.url('/dashboard/escrows');
                }
            });
        } 
        Escrow.getEscrows.query().$promise.then(function(reponse) {
            if (!reponse.error) {
                $scope.escrows = reponse.data;
                $scope.dataLoaded = true;
            }
        });
        $scope.selectEscrow = function(escrow) {
            $scope.escrow = escrow;
            $scope.escrowSelected = true;
            $location.url('/dashboard/escrows' + $scope.type + '/' + escrow._id);
        };
        $scope.backToEscrows = function() {
            $scope.escrowSelected = false;
            $location.url('/dashboard/escrows' + $scope.type);
        };
        $scope.refreshBalance = function(escrow) {
            var balance = new Escrow.getBalance({
                escrowId: escrow._id,
                user: $scope.user._id
            });
            balance.$query().then(function(response) {
                if (response.success) {
                    escrow.balance = response.balance;
                    escrow.status = response.status;
                    toastr.success('Balance for address ' + escrow.escrowAddress + ' updated!');
                }
            });
        };
        $scope.buyerRecievedChanged = function(value) {
            var recieved = new Escrow.buyerRecieved({
                id: $scope.escrow._id,
                recieved: value,
                user: $scope.user._id
            });
            recieved.$update();
        };
        $scope.sellerRecievedChanged = function(value) {
            var recieved = new Escrow.sellerRecieved({
                id: $scope.escrow._id,
                recieved: value,
                user: $scope.user._id
            });
            recieved.$update();
        };
        $scope.confirmSign = function(privateKey) {
            var escrow = new Escrow.signEscrow({
                id: $scope.escrowId,
                key: privateKey,
                user: $scope.user._id
            });
            escrow.$update().then(function(response) {
                if (response.success) {
                    $scope.escrows.forEach(function(escrow) {
                        if (escrow._id === $scope.escrowId) {
                            $scope.escrow.status = response.status;
                            $scope.modal.close();
                        }
                    });
                } else {
                    toastr.warning(response.errors);
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
                orderId : $scope.escrow.order ? $scope.escrow.order._id : null
            });
            escrow.$update().then(function(response) {
                if (response.success) {
                    $scope.escrows.forEach(function(escrow) {
                        if (escrow._id === $scope.escrowId) {
                            $scope.escrow = escrow;
                            $scope.escrow.status = 'CANCELLED';
                            $scope.modal.close();
                        }
                    });
                }
            });
            $rootScope.$broadcast('decrementBasketCount');
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
                    $scope.escrows.forEach(function(escrow) {
                        if (escrow._id === $scope.escrowId) {
                            $scope.escrow.status = response.status;
                            $scope.modal.close();
                        }
                    });
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
                    $scope.escrows.forEach(function(escrow) {
                        if (escrow._id === $scope.escrowId) {
                            $scope.escrow.status = response.status;
                            $scope.escrow.txid = response.txid;
                            $scope.modal.close();
                        }
                    });
                } else {
                    toastr.warning(response.errors);
                }
            });
        };
        $scope.dontCancel = function() {
            $scope.modal.close();
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
                    escrow.status = 'ESCROW PAID';
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
                }
            });
        };
    }
]);
