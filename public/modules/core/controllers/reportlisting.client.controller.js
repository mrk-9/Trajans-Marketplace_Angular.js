'use strict';
/*global $:false */
angular.module('core').controller('ReportlistingController', ['$rootScope', '$scope', 'ReportListing', '$stateParams', 'toastr', '$location', 'Utilities', '$modal',
    function($rootScope, $scope, ReportListing, $stateParams, toastr, $location, Utilities, $modal) {
        Utilities.notDashboard();
        Utilities.scrollTop();
        Utilities.showFooter();
        $scope.reportListing = function() {
            $scope.listingId = $stateParams.listingId;
            if ($scope.message) {
                var reportListing = new ReportListing.reportListing();
                reportListing.$save({
                    listingId: $scope.listingId,
                    message: $scope.message
                }).then(function(data) {
                    if (data.success) {
                        $scope.message = '';
                        toastr.success('Your e-mail has been sent successfully');
                        $rootScope.$broadcast('closeReportModal');
                    }
                });
            }
        };


        $scope.closeReportModal = function() {
            $rootScope.$broadcast('closeReportModal');
        };
    }
]);
