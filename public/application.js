'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$provide',
    function($locationProvider) {
        $locationProvider.hashPrefix('!');
    }
], function($provide) {
    $provide.decorator('masonryDirective', function($delegate) {
        var directive = $delegate[0];
        directive.link.post = directive.link.pre;
        delete(directive.link.pre);
        return $delegate;
    });
});

//Then define the init function for starting up the application
angular.element(document).ready(function() {
    //Fixing facebook bug with redirect
    if (window.location.hash === '#_=_') window.location.hash = '#!';

    //Then init the app
    angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});