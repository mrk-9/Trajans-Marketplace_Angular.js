'use strict';

angular.module('core').directive('homeBanner', function($timeout){
    return {
        restrict: 'A',
        scope: {
          bgColor: '@',
          bgImage: '@'
        },
        link: function(scope, element, attrs){
            $timeout(function(){

              if(scope.bgColor) {
                element.css('background', scope.bgColor);
              }

              if(scope.bgImage) {
                var url = 'url("/' + scope.bgImage + '")';
                element.css('background', url);
              }

              scope.$watch('bgColor', function(color){
                if(color) {
                  element.css('background', color);
                }
              });

              scope.$watch('bgImage', function(img){
                if(img) {
                  var url = 'url("/' + img + '")';
                  element.css('background', url);
                }
              });
            }, 100);
        }
    };
}); 