import * as path from 'path';
import * as fs from 'fs-extra';

module.exports = function() {
	let confPath = path.resolve(__dirname, `./env/${process.env.NODE_ENV}.js`);

	if (!fs.existsSync(confPath)) {
		if (process.env.NODE_ENV) {
			console.error('\x1b[31m', 'No configuration file found for "' + process.env.NODE_ENV + '" environment using development instead');
		} else {
			console.error('\x1b[31m', 'NODE_ENV is not defined! Using default development environment');
		}

		process.env.NODE_ENV = 'development';
	} else {
		console.log('\x1b[7m', 'Application loaded using the "' + process.env.NODE_ENV + '" environment configuration');
	}

	console.log('\x1b[0m');
};
