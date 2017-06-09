import * as _ from 'lodash';
import * as crypto from 'crypto';

export default {
	checkId,
	generateRandomToken,
	displayOrderItemsLikeString
};

function checkId(userId, ids) {
	let passed = false;

	_.forEach(ids, (id) => {
		if (id.toString() === userId.toString()) {
			passed = true;
		}
	});

	return passed;
}

async function generateRandomToken() {
	return new Promise((resolve, reject) => {
		crypto.randomBytes(20, (err, buffer) => {
			if (err) return reject(err);

			let token = buffer.toString('hex');

			return resolve(token);
		});
	});
}

function displayOrderItemsLikeString(items) {
	let result = '';

	_.forEach(items, (item) => {
		result += `${item.quantity} x ${item.name} | `;
	});

	result = result.trim().slice(0, -1);

	return result;
}