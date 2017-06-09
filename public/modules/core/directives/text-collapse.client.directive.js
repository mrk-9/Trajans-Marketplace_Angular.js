'use strict';

angular.module('core').directive('textCollapse', ['$compile', function($compile) {

    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {

            // start collapsed
            scope.collapsed = false;

            // create the function to toggle the collapse
            scope.toggle = function() {
                scope.collapsed = !scope.collapsed;
            };

            // wait for changes on the text
            attrs.$observe('textCollapseText', function(text) {

                // get the length from the attributes
                var maxLength = scope.$eval(attrs.textCollapseMaxLength);

                if (text.length > maxLength) {
                    // split the text in two parts, the first always showing
                    var firstPart = String(text).substring(0, maxLength);
                    var secondPart = String(text).substring(maxLength, text.length);

                    // create some new html elements to hold the separate info
                    var firstSpan = $compile('<span>' + firstPart + '</span>')(scope);
                    var secondSpan = $compile('<span ng-if="collapsed">' + secondPart + '</span>')(scope);
                    var lineBreak = $compile('<br ng-if="collapsed">')(scope);
                    var fadeBottom = $compile('<div ng-if="!collapsed" class="fade-bottom"></div>')(scope);
                    var toggleButton = $compile('<div class="collapse-text-toggle btn-more" ng-click="toggle()">{{collapsed ? "- Less" : "+ More"}}</div>')(scope);

                    // remove the current contents of the element
                    // and add the new ones we created
                    element.empty();
                    element.append(firstSpan);
                    element.append(secondSpan);
                    element.append(lineBreak);
                    element.append(fadeBottom);
                    element.append(toggleButton);
                }
                else {
                    element.empty();
                    element.append(text);
                }
            });
        }
    };
}]);