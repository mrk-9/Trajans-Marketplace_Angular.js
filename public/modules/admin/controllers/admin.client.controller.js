'use strict';

angular.module('admin').controller('AdminController', ['$scope', '$stateParams', '$location', 'Authentication', 'Admin', 'toastr', 'Utilities', 'TypewriterFactory',
    function($scope, $stateParams, $location, Authentication, Admin, toastr, Utilities, TypewriterFactory) {
        $scope.user = Authentication.user;
        Utilities.notDashboard();
        if (!$scope.user || $scope.user && $scope.user.roles[0] !== 'admin') $location.path('/');
        $scope.subscriptionStatus = ['Trial', 'Active', 'Canceled'];
        $scope.userAdminId = $stateParams.userAdminId;

        $scope.init = function() {
            $scope.findUsers();
            $scope.findTransactions();
            $scope.getSiteDefaults();
            $scope.selection = '';
            $scope.adminOptions = {
                areYouSure: false
            };

            $scope.text = {
                pendingText: '',
                pendingReplaced: ''
            };     

            $scope.phraseObject = {
                text: '',
                wordsAndIcons: []
            };
        };

        // Find a list of Users
        $scope.findUsers = function() {
            var userGet = Admin.users.query();
            userGet.$promise.then(function(users) {
                $scope.userProfiles = users;
            });

        };

        // Find user by id
        $scope.findOne = function() {
            var userProfile = Admin.users.get({
                userAdminId: $stateParams.userAdminId
            });
            userProfile.$promise.then(function(userProfile) {
                $scope.userProfile = userProfile;
            });

        };

        $scope.updateUserProfile = function(userForm) {
            var update = new Admin.adminUserUpdate($scope.userProfile);
            update.$save(function(user){
                $location.path('/admin');
            });
        };

        $scope.downloadDocs = function() {
            var user = Admin.documents.save({
                userDocId: $stateParams.userAdminId
            });
        };

        $scope.deleteDocs = function() {
            var user = Admin.users.documents({
                userDocId: $stateParams.userAdminId
            });
        };

        $scope.getSiteDefaults = function() {
            var defaults = Admin.siteDefaults.get({}, function(defaults){
                console.log(defaults);
                $scope.defaults = defaults;
                $scope.phraseHolder = [];

                // Add current typewriter text to the text array
                angular.copy($scope.defaults.typewriterText, $scope.phraseHolder);

                // assign default bannerStyle to local scope var
                $scope.bannerStyle = $scope.defaults.bannerStyle;
            });
        };


        // Initial replace of icon on admin panel
        $scope.replaceWordWithIcon = function(pendingText, selectedWords, glyphName) {

            var newWordsArray = angular.copy(selectedWords);

            // Create Object to pass to factory
            if(!$scope.phraseObject.text) {
                $scope.phraseObject = {
                    text: pendingText,
                    wordsAndIcons: [
                        {
                            words: newWordsArray,
                            icon: glyphName
                        }
                    ]
                };
            } else {
                $scope.phraseObject= TypewriterFactory.getTypewriterObject($scope.phraseObject, newWordsArray, glyphName);
            }
            
            $scope.text.pendingReplaced = TypewriterFactory.getPendingText($scope.text.pendingReplaced, $scope.phraseObject);
        };

        // Add the text and icons within this text to the main array
        // ready for updating
        $scope.addTextToArray = function(object) {
            if(!object.text) {
                object.text = $scope.text.pendingText;
            }
            $scope.adminOptions.areYouSure = true;
            $scope.phraseHolder.push(object);
        };

        // Update the DB with new default text array
        $scope.updateTypewriter = function(phraseHolder) {
            var defaults = $scope.defaults;
            defaults.typewriterText = phraseHolder;
            
            var update = new Admin.typewriter(defaults);
            update.$update(function(defaults){
                $scope.text.pendingText = '';
                $scope.text.pendingReplaced = '';
            });
        };

        $scope.changeTypewriterStatus = function(enabled) {
            var defaults = $scope.defaults;
            defaults.typewriterEnabled = enabled;
            
            var update = new Admin.typewriter(defaults);
            update.$update(function(defaults){});
        };

        // Remove this object from the typewriter
        $scope.removeFromTypewriter = function(index) {
            $scope.phraseHolder.splice(index, 1);

            $scope.updateTypewriter($scope.phraseHolder);
        };

        $scope.moveUp = function(index) {
            var typewriterText = $scope.defaults.typewriterText;

            // Short syntax to swap this item and item above
            var tmp = typewriterText[index];

            typewriterText[index] = typewriterText[index-1];

            typewriterText[index-1] = tmp;

            $scope.updateTypewriter(typewriterText);

            $scope.getSiteDefaults();
        };

        $scope.moveDown = function(index) {
            var typewriterText = $scope.defaults.typewriterText;

            // Short syntax to swap this item and item above
            var tmp = typewriterText[index];
            typewriterText[index] = typewriterText[index+1];
            typewriterText[index+1] = tmp;

            $scope.updateTypewriter(typewriterText);

            $scope.getSiteDefaults();
        };

        $scope.startOver = function() {
            $scope.text.pendingReplaced = '';
        };

        $scope.enableTransition = function() {
            $scope.bannerStyle.transition = true;
            $scope.bannerStyle.backgroundImage = '';
            $scope.bannerStyle.backgroundColor = '';
        };

        $scope.enableBgImage = function() {
            $scope.getSiteDefaults();
            $scope.bannerStyle.transition = false;
            $scope.bannerStyle.backgroundColor = '';
        };

        $scope.updateBanner = function() {
            var defaults = $scope.defaults;
            defaults.bannerStyle = $scope.bannerStyle;
            var update = new Admin.bannerStyles(defaults);
            update.$update(function(defaults){
                $scope.adminOptions.areYouSure = false; 
            });
        };

        $scope.submitImage = function(file, event, flow) {
            console.log(file);
            console.log(event);
            console.log(flow);
        };

        $scope.$on('colorpicker-selected', function() {
            $scope.bannerStyle.transition = false;
            $scope.bannerStyle.backgroundImage = '';
        });

        $scope.$on('flow::fileAdded', function (event, $flow, flowFile) {
          alert('test');
        });
    }
]);
