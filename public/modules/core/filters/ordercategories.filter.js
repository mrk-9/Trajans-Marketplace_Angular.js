'use strict';

angular.module('core').filter('orderCategories', function() {
  return function(items, field) {
    var filtered = [];
    angular.forEach(items, function(item) {
      switch(item.alias) {
      case 'technology':
          filtered[0] = item;
          break;
      case 'traveleventsactivities':
          filtered[1] = item;
          break;
      case 'artscollectables':
          filtered[2] = item;
          break;
      case 'sportsfitness':
          filtered[3] = item;
          break;
      case 'healthbeauty':
          filtered[4] = item;
          break;
      case 'booksmusictv':
          filtered[5] = item;
          break;
      case 'babychildren':
          filtered[6] = item;
          break;
      case 'foodwine':
          filtered[7] = item;
          break;
      case 'fashion':
          filtered[8] = item;
          break;
      case 'homegarden':
          filtered[9] = item;
          break;
      case 'entertainment':
          filtered[10] = item;
          break;
      case 'dealsgifts':
          filtered[11] = item;
          break;
      } 
    });
    return filtered;
  };
});