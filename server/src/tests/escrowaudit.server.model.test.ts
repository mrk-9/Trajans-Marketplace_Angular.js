'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	EscrowAudit = mongoose.model('EscrowAudit');

/**
 * Globals
 */
var user, escrowAudit;

/**
 * Unit tests
 */
describe('Escrow audit Model Unit Tests:', function() {
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
			escrowAudit = new EscrowAudit({
				// Add model fields
				// ...
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return escrowAudit.save(function(err) {
				should.not.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		EscrowAudit.remove().exec();
		User.remove().exec();

		done();
	});
});