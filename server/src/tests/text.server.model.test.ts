import * as mongoose from 'mongoose';
'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	User = mongoose.model('User'),
	Text = mongoose.model('Text');

/**
 * Globals
 */
var user, text;

/**
 * Unit tests
 */
describe('Text Model Unit Tests:', function() {
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
			text = new Text({
				// Add model fields
				// ...
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return text.save(function(err) {
				should.not.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		Text.remove().exec();
		User.remove().exec();

		done();
	});
});