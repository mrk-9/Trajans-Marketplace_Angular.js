'use strict';

angular.module('core').directive('sameHeight', function($timeout){
    function link(scope, element, attrs) { //scope we are in, element we are bound to, attrs of that element
      scope.$watch(function(){ //watch any changes to our element
        scope.divheight = { //scope variable style, shared with our controller
          height:element[0].offsetHeight+'px'
        };
      });
    }
    return {
      restrict: 'AE', //describes how we can assign an element to our directive in this case like <div master></div
      link: link // the function to link to our element
    };
}); 