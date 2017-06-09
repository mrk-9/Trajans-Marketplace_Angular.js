'use strict';
/*global moment:false, braintree:false */

angular.module('users').controller('SubscriptionController', ['$scope', '$rootScope', '$stateParams', '$location', '$locale', 'Authentication', 'Subscription', 'Users', 'Utilities', 'toastr',
    function($scope, $rootScope, $stateParams, $location, $locale, Authentication, Subscription, Users, Utilities, toastr) {
        Utilities.isDashboard();
        Utilities.scrollTop();
        Utilities.hideFooter();
        $scope.authentication = Authentication;
        $scope.user = Authentication.user;
        $scope.currentYear = new Date().getFullYear();
        $scope.currentMonth = new Date().getMonth() + 1;
        $scope.months = $locale.DATETIME_FORMATS.MONTH;
        $scope.priceplan = $stateParams.priceplan;
        if(!$scope.user) {
            $location.path('/signup');
        }
        $scope.continued = false;
        $scope.planCycleWarning = false;
        $scope.plansReady = false;
        $scope.newPlan = {
            name: '',
            billingCycle: 1
        };
        $scope.userId = Authentication.user.id;

        $scope.subscribe = function(form) {
            $location.path('/dashboard/subscription/confirm/priceplan/' + $scope.priceplan);
        };
        $scope.confirm = function() {
            var addSubscription = new Subscription.subscription();
            addSubscription.$save({
                planname: $scope.priceplan
            }).then(function(response) {
                if(response.success) {
                    $scope.user.subscriptionStatus = ['Active'];
                    $location.path('/dashboard/home');
                    toastr.success(response.message);
                } else {
                    toastr.error('Something wen\'t wrong.. please contact our support team for more information.');
                }
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.cancel = function() {
            var subscription = new Subscription.subscription();
            subscription.$remove().then(function(response) {
                if(response.success) {
                    $scope.user.subscriptionStatus = ['Cancelled'];
                    $location.path('/dashboard/home');
                    toastr.success(response.message);
                } else {
                    toastr.error('Something wen\'t wrong.. please contact our support team for more information.');
                }
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.getCurrentSubscription = function() {
            $scope.currentSubscription = Subscription.subscription.query();
            $scope.currentSubscription.$promise.then(function(subscription) {
                $scope.plansReady = true;
                if (subscription) {
                    $scope.subscription = subscription;
                    $scope.planOption = 'change';
                    $scope.currentPlanGroup = subscription.group;
                } else {
                    $scope.planOption = 'payment';
                }
            }, function(err){
                toastr.error('Error getting current subscription. Please contact the helpdesk.');
            });
        };

        $scope.getSubscriptionByName = function() {
            $scope.getSubscription = Subscription.getPlanByName.query({
                planName: $stateParams.priceplan
            });
            $scope.getSubscription.$promise.then(function(plan) {
                $scope.newPlan = plan;
            }, function(err){
                toastr.error('Error getting new subscription. Please contact the helpdesk.');
            });
        };

        $scope.changePlan = function() {
            var addSubscription = new Subscription.subscription();
            addSubscription.$save({
                planname: $scope.priceplan
            }).then(function(response) {
                if(response.success) {
                    toastr.success('Subscription changed successfully!');
                    $location.path('/dashboard/home');
                } else {
                    toastr.error('Something wen\'t wrong.. please contact our support team for more information.');
                    var opened = toastr.isOpened;
                }
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.getAllPlans = function() {
            $scope.continue = false;
            $scope.allPlans = Subscription.getPlanOptions.query();

            $scope.annualPlanPrices = [];

            $scope.allPlans.$promise.then(function(plans) {
                $scope.plansReady = true;
                $scope.plans = plans;
            });
        };
    }
]);
