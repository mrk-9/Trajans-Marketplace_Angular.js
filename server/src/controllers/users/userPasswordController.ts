import * as moment from 'moment';

import helper from '../_controllerHelper';
import emailService from '../../services/emailService';
import emailMerges from '../../emails/emailMerges';
import utilityService from '../../services/utilitiesService';
import userRepository from '../../repositories/userRepository';

export default {
	forgotPassword,
	validateResetToken,
	resetPassword,
	changePassword
};

async function forgotPassword(req, res) {
	try {
		let query = req.body.user;

		if (!query) throw new Error('Username field must not be blank');

		let token = await utilityService.generateRandomToken();

		let user = await userRepository.getUserByNameOrEmail(query.toLowerCase());

		if (!user) throw new Error('No account with that username or email has been found');

		if (user.provider !== 'local') throw new Error(`It seems like you signed up using your ${user.provider} account`);

		await userRepository.updateResetPasswordToken(user, token);

		sendForgotPasswordEmail(user, req.headers.host, token);

		let email = displayEmail(user.email);

		let message = `An email has been sent to ${email} with further instructions.`;

		helper.sendData({message}, res);
	} catch (err) {
		helper.sendFailureMessage(err, res);
	}
}

async function validateResetToken(req, res) {
	try {
		let token = req.params.token;

		if (!token) throw new Error('Password Reset Token is required');

		let user = await userRepository.getUserByResetPasswordToken(token);

		if (!user) return res.redirect('/#!/password/reset/invalid');

		res.redirect(`/#!/password/reset/${token}`);
	} catch (err) {
		helper.sendFailureMessage(err, res);
	}
}

async function resetPassword(req, res) {
	try {
		let token = req.params.token;

		let passwordDetails = req.body;

		if (!token) throw new Error('Password Reset Token is required');

		if (!passwordDetails.newPassword) throw new Error('New Password is required');

		if (passwordDetails.newPassword !== passwordDetails.verifyPassword) {
			throw new Error('Passwords do not match');
		}

		let user = await userRepository.getUserByResetPasswordToken(token);

		if (!user) throw new Error('Password reset token is invalid or has expired.');

		let updatedUser = await userRepository.updateUserPassword(user, passwordDetails.newPassword);

		sendPasswordUpdatedEmail(updatedUser);

		let loginUser = await helper.reqLogin(req, updatedUser);

		return helper.sendData(loginUser, res);
	} catch (err) {
		helper.sendFailureMessage(err, res);
	}
}

async function changePassword(req, res) {
	try {
		let userData = req.user;
		let passwordDetails = req.body;

		if (!userData) throw new Error('User is not signed in');

		if (!passwordDetails.newPassword) throw new Error('Please provide a new password');

		let user = await userRepository.getUserById(userData._id);

		if (!user) throw new Error('User is not found');

		if (!user.authenticate(passwordDetails.currentPassword)) throw new Error('Current password is incorrect');

		if (passwordDetails.newPassword !== passwordDetails.verifyPassword) throw new Error('Passwords do not match');

		let updatedUser = await userRepository.updateUserPassword(user, passwordDetails.newPassword);

		await helper.reqLogin(req, updatedUser);

		return helper.sendData({message: 'Password changed successfully'}, res);
	} catch (err) {
		helper.sendFailureMessage(err, res);
	}
}

//helpers methods

function sendForgotPasswordEmail(user, host, token) {
	let url = `http://${host}/auth/reset/${token}`;

	let mergeVars = emailMerges.passwordUpdateRequest(user.firstName, url);

	let mailOptions = {
		user: user,
		recipientEmail: user.email,
		templateName : 'Password reset- request (User)',
		merge_vars: mergeVars
	};

	emailService.sendMandrillEmail(mailOptions);
}

function sendPasswordUpdatedEmail(user) {
	let time = moment().format('h:mma');

	let date = moment().format('MMMM Do YYYY');

	let mergeVars = emailMerges.passwordUpdated(user.firstName, time, date);

	let mailOptions = {
		user: user,
		recipientEmail: user.email,
		templateName : 'Password reset- confirmed (User)',
		merge_vars: mergeVars
	};

	emailService.sendMandrillEmail(mailOptions);
}

function displayEmail(email) {
	const stars = '*****';

	let result = '';

	let array = email.split('@');

	result = array[0].substr(0, 4);

	result += `${stars}@${array[1]}`;

	return result;
}