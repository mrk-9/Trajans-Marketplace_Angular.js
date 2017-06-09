'use strict';

(function() {
	// Categories Controller Spec
	describe('Categories Controller Tests', function() {
		// Initialize global variables
		var CategoriesController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Categories controller.
			CategoriesController = $controller('CategoriesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Category object fetched from XHR', inject(function(Categories) {
			// Create sample Category using the Categories service
			var sampleCategory = new Categories({
				name: 'New Category'
			});

			// Create a sample Categories array that includes the new Category
			var sampleCategories = [sampleCategory];

			// Set GET response
			$httpBackend.expectGET('categories').respond(sampleCategories);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.categories).toEqualData(sampleCategories);
		}));
	});
}());