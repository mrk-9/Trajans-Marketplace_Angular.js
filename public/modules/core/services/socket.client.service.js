'use strict';

//Orders service used to communicate Orders REST endpoints
angular.module('orders').factory('mySocket', function (socketFactory) {
  return socketFactory();
});

