'use strict';

angular.module('users').filter
  ( 'range', function() {
      var filter = 
        function(arr, lower, upper) {
          for (var i = lower; i <= upper; i++) arr.push(i);
          return arr;
        };
      return filter;
    }
  );