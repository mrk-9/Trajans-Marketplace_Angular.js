process.on('uncaughtException', function (err) {
    console.error(err);
});

import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import config from './config/config';
import logger from './services/loggerService';
import db from './database/database';
import server from './server';

// Bootstrap db connection
db.init();

// Init the express application
let app = server();

// Bootstrap passport config
require('./auth/passport')();

// Start the app by listening on <port>
app.listen(config.server.port);

// Expose app
exports = module.exports = app; // jshint ignore:line

// Logging initialization
console.log('Trajans app started on port ' + config.server.port);
