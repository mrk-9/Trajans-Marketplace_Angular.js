'use strict';

angular.module('users').directive('affix', ['$rootScope', '$timeout', function($rootScope, $timeout) {
    return {
        link: function($scope, $element, $attrs) {

            function applyAffix() {
                $timeout(function() {
                    if ($element.affix) {
                        $element.affix({
                            offset: {
                                top: $attrs.offsetTop,
                                bottom: $attrs.offsetBottom
                            }
                        });
                    }
                });
            }
            $rootScope.$on('$stateChangeSuccess', function() {
                if ($element.affix) {
                    $element.removeData('bs.affix').removeClass('affix affix-top affix-bottom');
                    applyAffix();
                }

            });
            applyAffix();
        }
    };
}]);
