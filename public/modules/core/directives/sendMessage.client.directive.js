'use strict';

angular.module('core').directive('sendmessage', function sendMessage($timeout, $rootScope) {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        templateUrl: 'modules/core/directives/_sendMessage.tmpl.html',
        controllerAs: 'message',
        controller: function($stateParams, $scope, $rootScope, $location, Messaging, toastr) {
            this.message = {};
            $scope.cancel = function() {
                $rootScope.$broadcast('closeMessageModal');
            };
            this.send = function(message) {
                var newMessage = new Messaging.sendMessage({
                    subject: message.subject,
                    content: message.content,
                    recipientId: $scope.user._id,
                    markAsReplied: false
                });
                newMessage.$save(function(response) {
                    toastr.info('Message successfully sent.');
                    $rootScope.$broadcast('closeMessageModal');
                });
            };
        },
    };
});
