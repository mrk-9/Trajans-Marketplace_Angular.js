'use strict';

angular.module('core').filter('dateTimeFormat', ['moment', function(moment) {
	return function(date) {
	  	return moment(date).format('DD/MM/YYYY h:mm:ss a');
	};
}]);
