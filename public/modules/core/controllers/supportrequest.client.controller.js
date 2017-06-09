'use strict';
/*global $:false */
angular.module('core').controller('SupportRequestController', ['$scope', 'SupportRequest', '$stateParams', 'toastr', '$location', 'Utilities',
    function($scope, SupportRequest, $stateParams, toastr, $location, Utilities) {
        Utilities.notDashboard();
        Utilities.scrollTop();
        Utilities.showFooter();
        $scope.supportrequest = function() {
            if ($scope.contact.subject && $scope.contact.description ) {
                var supportrequest = new SupportRequest.supportrequest({
                    subject: $scope.contact.subject,
                    description: $scope.contact.description
                });
                supportrequest.$save().then(function(data) {
                    if(data.success){
                        $scope.contact.description = '';
                        $location.path('account');
                        toastr.success('Your support request has been sent successfully');
                    }
                });
            }
        };
    }
]);
