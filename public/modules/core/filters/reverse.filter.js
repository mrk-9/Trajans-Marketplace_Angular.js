'use strict';

angular.module('core').filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});