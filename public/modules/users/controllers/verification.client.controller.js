'use strict';
/*global $:false */

angular.module('users').controller('VerificationController', ['$scope', '$rootScope', '$http', '$location', 'Users', 'Authentication', 'toastr', '$interval', 'Utilities', '$window', '$timeout',
    function($scope, $rootScope, $http, $location, Users, Authentication, toastr, $interval, Utilities, $window, $timeout) {
        Utilities.notDashboard();
        Utilities.scrollTop();
        Utilities.showFooter();
        $scope.user = Authentication.user;
        // If user is not signed in then redirect back home
        if (!$scope.user) $location.path('/');

        if($location.path() !== '/dashboard/home') {
            $timeout(function(){
                $window.open('https://signup.bitpos.me?aId=718283', '_blank');
                $location.path('/dashboard/home');
            }, 5000);
        }

        $scope.documentType = '';
        $scope.documents = [];

        $scope.verify = function() {
            if($scope.documents.length < 2) {
                toastr.error('Please upload a minimum of 2 documents!');
            } else {
                $http.post('/users/verify', $scope.verifyDetails).success(function(response) {
                    toastr.success('Your documents have been submitted for review');
                    $location.path('/dashboard/home');
                }).error(function(response) {
                    toastr.error(response.message);
                });
            }
        };

        $scope.$on('flow::fileAdded', function(event, $flow, flowFile) {
            if(!$scope.documentType) {
                $flow.preventEvent(event);
            }
            $scope.documents = $flow.files;
            flowFile.name = $scope.documentType; 
            $scope.documentType = '';  
            $scope.uploading = true;

        });  

        $scope.$on('flow::fileSuccess', function(file,message){
            //console.log(file,message);
            $scope.uploading = false;
            $scope.uploaded = true;
        });       
        $scope.$on('flow::fileError', function(file, message){
            toastr.error('Whoops there was an error uploading your documents...');
        });        
        $scope.$on('flow::filesSubmitted', function(event, $flow, flowFile) {
            $flow.upload();
        });

        $scope.sendAccountVerificationEmail = function() {
            $http.post('/auth/sendverificationemail', {userEmail: $scope.user.email}).success(function(response){
                toastr.success('A new verification email has been sent to your email address. Please click the link within this email to verify your account.');
            }).error(function(response) {
                toastr.error(response.message);
            });
        };
    }
]);
