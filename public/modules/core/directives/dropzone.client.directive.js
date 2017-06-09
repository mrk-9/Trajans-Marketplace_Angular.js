'use strict';
/*global Dropzone:false */

angular.module('core').directive('dropzone', function() {
    return function(scope, element, attrs) {
        var config, dropzone;
        var $scope = scope;
        config = { 
            'url': $scope.uploadUrl,
            'maxFilesize': 2,
            'acceptedFiles': 'image/jpeg,image/png'
        };
        dropzone = new Dropzone(element[0], config);
        dropzone.on('success', function(file, response, formData) {
            $scope.dropZoneConfig.success(response);
        });
        dropzone.on('queuecomplete', function(){
            $scope.dropZoneConfig.queuecomplete();
        });
        dropzone.on('addedfile', function(){
            $scope.dropZoneConfig.addedfile();
        });
    };
});
