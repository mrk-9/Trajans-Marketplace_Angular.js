'use strict';

/*global $:false */

// Listings controller
angular.module('listings').controller('ModalCropController', ['$scope', '$rootScope', '$modal', '$modalInstance', '$stateParams', '$location', 'Authentication', 'Listings', 'Categories', 'Orders', 'Menus', 'toastr', 'listing',
    function($scope, $rootScope, $modal, $modalInstance, $stateParams, $location, Authentication, Listings, Categories, Orders, Menus, toastr, listing) {
        $scope.listing = listing;
        $scope.cancelModal = function() {
            $modalInstance.dismiss('cancel');
            $rootScope.$broadcast('reloadHeader', true);
        };
    }
]);
