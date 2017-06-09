'use strict';

angular.module('core').filter('htmlToPlainText', function() {
	return function(text) {
	  return String(text).replace(/<[^>]+>/gm, '');
	};
});