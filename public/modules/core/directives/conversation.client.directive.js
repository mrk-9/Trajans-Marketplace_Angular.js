'use strict';
/*global $:false */
angular.module('core').directive('conversation', function(Authentication, mySocket, $timeout) {
    return {
        restrict: 'E',
        templateUrl: 'modules/core/directives/conversation.html',
        link: function($scope, el, attrs) {
            $scope.conversationMessage = {};
            $scope.authentication = Authentication;
            if ($scope.authentication.user.data) {
                $scope.user = $scope.authentication.user.data;
            } else {
                $scope.user = $scope.authentication.user;
            }
            $scope.conversation = JSON.parse(attrs.conversation);
            mySocket.emit('joinConversationRoom', $scope.conversation._id);
            $scope.addMessageToConversation = function(replyMessage) {
                if ($scope.conversationMessage.message) {
                    var to;
                    if ($scope.user._id !== $scope.conversation.from) {
                        to = $scope.conversation.from;
                    } else {
                        to = $scope.conversation.to;
                    }
                    mySocket.emit('newMessage', {
                        message: $scope.conversationMessage.message,
                        id: $scope.conversation._id,
                        to: to,
                        userId: $scope.user._id,
                        userName: $scope.user.username
                    });
                    mySocket.on('newMessageSuccess', function(response) {
                        if (response.data) {
                            response.data.message.from = {};
                            response.data.message.from.displayName = response.data.from;
                            $scope.conversation.messages.push(response.data.message);
                            $scope.conversationMessage.message = '';
                            $timeout(function() {
                                $('.messages').scrollTop(1E10);
                            }, 200);
                            mySocket.removeAllListeners();
                        }
                    });
                }
            };

        }
    };
});
