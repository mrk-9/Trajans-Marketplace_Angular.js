import * as mongoose from 'mongoose';
'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	User = mongoose.model('User'),
	Category = mongoose.model('Category');

/**
 * Globals
 */
var user, category;

/**
 * Unit tests
 */
describe('Category Model Unit Tests:', function() {
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
			category = new Category({
				name: 'Category Name',
				user: user
			});

			done();
		});
	});
});
