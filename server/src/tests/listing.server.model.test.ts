'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Listing = mongoose.model('Listing');

/**
 * Globals
 */
var user, listing;

/**
 * Unit tests
 */
describe('Listing Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		user.save(function() { 
			listing = new Listing({
				name: 'Listing Name',
				category: 'Listing Category',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return listing.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) { 
			listing.name = '';

			return listing.save(function(err) {
				should.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without a category', function(done) { 
			listing.category = '';

			return listing.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		Listing.remove().exec();
		User.remove().exec();

		done();
	});
});