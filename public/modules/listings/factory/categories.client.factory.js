'use strict';

/*global $:false */

angular.module('listings').factory('CategoryFactory', [ 'Categories', 'lodash',
    function(Categories, _) {
        var categoryFactory = {};

        categoryFactory.getPrimaryCategories = function (category){
        	return Categories.primaryCategories.query({primaryCategory : category}, function(data){
        		return data;
        	});
        };

        categoryFactory.getSecondaryCategories = function (category){
        	return Categories.secondaryCategories.query({secondaryCategory : category}, function(data){
        		return data;
        	});
        };

        categoryFactory.getTertiaryCategories = function (category){
        	return Categories.tertiaryCategories.query({tertiaryCategory : category}, function(data){
        		return data;
        	});
        };
		
        return categoryFactory;
    }
]);
