'use strict';
/*global moment:false, $:false  */

angular.module('users').controller('UserController', ['$scope', '$rootScope', 'Authentication', 'Subscription', 'Orders', '$interval', '$modal', 'Utilities', '$location',
    function($scope, $rootScope, Authentication, Subscription, Orders, $interval, $modal, Utilities, $location) {
        if($location.$$path.match('dashboard')){
            Utilities.isDashboard();
        } else {
            Utilities.notDashboard();
        }
        Utilities.scrollTop();
        Utilities.showFooter();
        $scope.user = Authentication.user;
        $scope.flowFile = false;
        $scope.checkedForSubscription = false;
        if ($scope.user.hasUploadedImage) {
            $scope.userImgage = '/userimageuploads/' + $scope.user.userImageName;
        }

        $scope.getSubscriptionDetails = function() {
            $scope.details = Subscription.subscription.query();

            $scope.details.$promise.then(function(details){
                $scope.subscriptionDetails = details;
                $scope.checkedForSubscription = true;
            }, function(err){
                $scope.checkedForSubscription = true;
            });
        };
        $scope.getSubscriptionDetails();
        
    
        if ($scope.user) {
            $scope.orders = Orders.pendingOrders.query();
            $scope.orders.$promise.then(function(orders) {
                $scope.basketCount = orders.length;
            });
            $scope.$on('basketCount', function(event, count) {
                $scope.basketCount = count;
            });
        }
        //TODO Upload user image...
        $scope.userImage = $scope.user._id;
        $scope.$on('flow::fileAdded', function(event, $flow, flowFile) {
            $scope.stop = $interval(function() {
                $scope.flowFile = true;
            }, 1000);
        });

        $scope.featuredMerchantModal = function(user) {
            var featuredModalInstance = $modal.open({
                templateUrl: 'modules/core/views/featured-merchant.client.view.html',
                controller: 'TransactionController',
                resolve: {
                    user: function() {
                        return $scope.user;
                    }
                }
            });
        };
    }
]);
