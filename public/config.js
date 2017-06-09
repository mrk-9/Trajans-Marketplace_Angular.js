'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'Trajans-marketplace';

	var applicationModuleVendorDependencies = ['ngResource', 'ngRoute', 'ngCookies', 'duScroll', 'ngTouch', 'ngSanitize',
		'ui.router', 'ui.bootstrap', 'ui.utils', 'flow', 'truncate', 'textAngular', 'angular-loading-bar', 'btford.socket-io',
		'angularUtils.directives.dirPagination', 'angulike', 'toastr', 'angularMoment', 'ngLodash', 'imageCropper',
		'nate.util', 'ngSelect', 'colorpicker.module', 'akoenig.deckgrid', 'angular-clipboard', 'infinite-scroll', 'rzModule'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})(); 