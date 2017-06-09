'use strict';

/*global $:false */

angular.module('core').directive('readmessage', function readMessage($timeout) {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        templateUrl: 'modules/core/directives/_readMessage.tmpl.html',
        controllerAs: 'message',
        controller: function($stateParams, $scope, $rootScope, $location, Messaging, toastr) {
            $scope.replyToMessage = function(response) {
                var newMessage = new Messaging.sendMessage({
                    subject: 'RE: ' + $scope.message.subject,
                    content: response.reply,
                    recipientId: $scope.message.senderId,
                    messageId: $scope.message._id,
                    markAsReplied: true
                });
                newMessage.$save(function(response) {
                    $rootScope.showMessageDetails = false;
                    toastr.info('Message successfully sent.');
                });
            };
            $scope.delete = function() {
                $scope.message.$remove(function() {
                    $rootScope.showMessageDetails = false;
                    toastr.info('Message Deleted.');
                    $scope.userMessages.splice($scope.messageIndex, 1);
                });
            };
            $scope.getMessage = Messaging.message.get({
                messageId: $scope.messageId
            });
            $scope.getMessage.$promise.then(function(message) {
                $scope.message = message;
                $scope.reply = false;
            });
        },
        link: function(scope, element, attrs, ctrl) {
            var textarea = element.find('textarea')[0];
            scope.$watch('reply', function(newVal, oldVal) {
                if (newVal === oldVal) return;
                if (newVal) {
                    $timeout(function() {
                        textarea.focus();
                    }, 0);
                }
            });
        }
    };
});
