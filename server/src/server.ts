//TODO what is that?
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import * as morgan from 'morgan';
import * as mongoose from 'mongoose';

import pathHelper from './helpers/pathHelper';
import config from './config/config';
import cron from './services/cronService';
import escrowScheduler from './factory/escrow-scheduler';
import appRoutes from './routes/routes';
import socketService from './services/socketService';

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const compress = require('compression');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const passport = require('passport');
const mongoStore = require('connect-mongo')({
    session: session
});
const flash = require('connect-flash');
const consolidate = require('consolidate');
const path = require('path');
const gitRev = require('git-rev-sync');
const cors = require('cors');

export default function() {
    // Initialize express app
    let app = express();
    let server = require('http').createServer(app);
    let io = require('socket.io').listen(server);

    app.use(cors());

    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Max-Age', '3000');
        return next();
    });

    // Setting application local variables
    app.locals.title = config.app.title;
    app.locals.description = config.app.description;
    app.locals.keywords = config.app.keywords;
    app.locals.jsFiles = config.getJavaScriptAssets();
    app.locals.cssFiles = config.getCSSAssets();

    let version = gitRev.short();
    app.locals.applicationJs = 'dist/application-' + version + '.min.js';

    // Passing the request url to environment locals
    app.use(function(req, res, next) {
        res.locals.url = req.protocol + '://' + req.headers.host + req.url;
        next();
    });

    // Should be placed before express.static
    app.use(compress({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    // Showing stack errors
    app.set('showStackError', true);

    // Set swig as the template engine
    app.engine('server.view.html', consolidate['swig']);

    // Set views path and view engine
    app.set('view engine', 'server.view.html');
    app.set('views', pathHelper.getDataRelative('./views'));

    // Environment dependent middleware
    if (config.isDevLocal) {
        // Enable logger (morgan)
        app.use(morgan('dev'));

        // Disable views cache
        app.set('view cache', false);
    } else {
        app.locals.cache = 'memory';
    }

    let uploadsPath = pathHelper.getLocalRelative('./uploads');
    app.use(multer({ dest:  uploadsPath}));

    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser.urlencoded({
        extended: true,
        limit: '500mb'
    }));
    app.use(bodyParser.json({ limit: '500mb' }));
    app.use(methodOverride());

    // Enable jsonp
    app.enable('jsonp callback');

    // CookieParser should be above session
    app.use(cookieParser());

    // Express MongoDB session storage
    app.use(session({
        saveUninitialized: true,
        resave: true,
        secret: config.server.sessionSecret,
        store: new mongoStore({
            mongooseConnection: mongoose.connection,
            collection: 'sessions'
        })
    }));

    // use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    // connect flash for flash messages
    app.use(flash());

    // Use helmet to secure Express headers
    app.use(helmet.xframe());
    app.use(helmet.xssFilter());
    app.use(helmet.nosniff());
    app.use(helmet.ienoopen());
    app.disable('x-powered-by');

    // Setting the app router and static folder
    let publicPath = pathHelper.getRelative('root', '../public');
    app.use(express.static(publicPath));

    appRoutes.init(app);

    // Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
    app.use(function(err, req, res, next) {
        // If the error object doesn't exists
        if (!err) return next();

        // Log it
        console.error(err.stack);

        // Error page
        res.status(500).render('500', {
            error: err.stack
        });
    });

    // Assume 404 since no middleware responded
    app.use(function(req, res) {
        res.status(404).render('404', {
            url: req.originalUrl,
            error: 'Not Found'
        });
    });

    socketService.init(io);

    //Cron jobs
    cron.updatePriceTicker();
    cron.checkOrdersExpired(io);
    cron.sendPurchaseNotification(io);
    cron.checkUserSubscriptions();
    cron.sendReviewEmails();
    cron.deleteLocalImages();
    cron.checkFeaturedExpired();
    cron.marketCap();
    cron.blogPosts();
    escrowScheduler.init(io);

    // Bootstrap the website
    //bootstrap.bootStrapSite();

    return server;
};
