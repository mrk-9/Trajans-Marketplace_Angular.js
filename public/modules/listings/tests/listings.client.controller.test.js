'use strict';

(function() {
	// Listings Controller Spec
	describe('Listings Controller Tests', function() {
		// Initialize global variables
		var ListingsController,
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

			// Initialize the Listings controller.
			ListingsController = $controller('ListingsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Listing object fetched from XHR', inject(function(Listings) {
			// Create sample Listing using the Listings service
			var sampleListing = new Listings({
				name: 'New Listing'
			});

			// Create a sample Listings array that includes the new Listing
			var sampleListings = [sampleListing];

			// Set GET response
			$httpBackend.expectGET('listings').respond(sampleListings);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.listings).toEqualData(sampleListings);
		}));

		it('$scope.findOne("view") should create an array with one Listing object fetched from XHR using a listingId URL parameter', inject(function(Listings) {
			// Define a sample Listing object
			var sampleListing = new Listings({
				name: 'New Listing'
			});

			// Set the URL parameter
			$stateParams.listingId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/listings\/([0-9a-fA-F]{24})$/).respond(sampleListing);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.listing).toEqualData(sampleListing);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Listings) {
			// Create a sample Listing object
			var sampleListingPostData = new Listings({
				name: 'New Listing'
			});

			// Create a sample Listing response
			var sampleListingResponse = new Listings({
				_id: '525cf20451979dea2c000001',
				name: 'New Listing'
			});

			// Fixture mock form input values
			scope.name = 'New Listing';

			// Set POST response
			$httpBackend.expectPOST('listings', sampleListingPostData).respond(sampleListingResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Listing was created
			expect($location.path()).toBe('/listings/' + sampleListingResponse._id);
		}));

		it('$scope.update() should update a valid Listing', inject(function(Listings) {
			// Define a sample Listing put data
			var sampleListingPutData = new Listings({
				_id: '525cf20451979dea2c000001',
				name: 'New Listing'
			});

			// Mock Listing in scope
			scope.listing = sampleListingPutData;

			// Set PUT response
			$httpBackend.expectPUT(/listings\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/listings/' + sampleListingPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid listingId and remove the Listing from the scope', inject(function(Listings) {
			// Create new Listing object
			var sampleListing = new Listings({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Listings array and include the Listing
			scope.listings = [sampleListing];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/listings\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleListing);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.listings.length).toBe(0);
		}));
	});
}());