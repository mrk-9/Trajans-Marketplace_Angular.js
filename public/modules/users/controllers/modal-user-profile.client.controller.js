'use strict';

/*global $:false */

// Listings controller
angular.module('users').controller('ModalProfileController', ['$scope', '$rootScope', '$modal', '$modalInstance', '$stateParams', '$location', 'Authentication', 'Users', 'user',
    function($scope, $rootScope, $modal, $modalInstance, $stateParams, $location, Authentication, Users, user) {

        $scope.loggedInUser = Authentication.user;
        $scope.user = user;

        $scope.showAllText = false;
        $scope.limit = 2;

        $scope.cancelModal = function() {
            $modalInstance.dismiss('cancel');
            $('html, body').animate({
                scrollTop: 0 
            }, 100);
        };

        $scope.init = function() {
            $scope.getReviews();
            $scope.getSubscriptionInfo();
        };

        $scope.getReviews = function() {
            $scope.userReviews = Users.reviews.query({
              userIdForReviews: user._id
            });
            $scope.userReviews.$promise.then(function(reviews) {
                $scope.allReviews = reviews;

                var totalRating = 0;
                angular.forEach(reviews, function(review){
                  totalRating += review.rating;
                });
                if(totalRating) {
                    $scope.overallSellerRating = totalRating / reviews.length;
                    $scope.decimalScore = parseFloat($scope.overallSellerRating.toFixed(2));
                    $scope.starScore = parseInt($scope.overallSellerRating.toFixed());
                } else {
                    $scope.decimalScore = 0.00;
                    $scope.starScore = 0;
                }
            });
        };

        $scope.getSubscriptionInfo = function() {
            $scope.getSubscriptionType = Users.currentSubscription.query({
                userId: $scope.user._id
            });
            $scope.getSubscriptionType.$promise.then(function(plan){
                $scope.usersPlan = plan[0];
                console.log($scope.usersPlan);
            });
        };

        $scope.loadMoreReviews = function() {
            $scope.limit = $scope.limit + 2;
        };

        $scope.openMessageModal = function() {
            $scope.reportmodal = $modal.open({
                templateUrl: 'modules/core/views/contactuser.client.view.html',
                controller : 'MessagingController',
                resolve : {
                    user: function() {
                        return $scope.user;
                    }
                }
            });
        };

        //close report modal;

        $rootScope.$on('closeMessageModal', function(){
            $scope.reportmodal.close();
        });
    }
]);