'use strict';

angular.module('core').factory('Broadcaster', function($rootScope) {
    var sharedService = {};

    sharedService.category = {};
    sharedService.keyword = '';

    sharedService.broadcastCategoryChanged = function(category) {
        this.category = category;
        this.keyword = '';
        this.broadcastItem('categoryChanged');
    };

    sharedService.broadcastSearchKeyword = function(keyword) {
        this.keyword = keyword;
        this.category = {};
        this.broadcastItem('searchKeyword');
    };

    sharedService.broadcastItem = function(event) {
        $rootScope.$broadcast(event);
    };

    return sharedService;
});