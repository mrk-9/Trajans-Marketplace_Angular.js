'use strict';

angular.module('core').factory('ReportListing', ['$resource',
    function($resource) {
        return {
            reportListing: $resource('/reportlisting/:reportListingId', {
                reportListingId: '@_reportListingId'
            })
        };
    }
]);
