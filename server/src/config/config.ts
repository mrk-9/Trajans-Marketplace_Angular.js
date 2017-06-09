import * as fs from 'fs-extra';
import pathHelper from '../helpers/pathHelper';
import * as _ from 'lodash';

let logConfig = false;
let isDevLocal = process.env.NODE_ENV !== 'production';
let assets = isDevLocal ? require('./assets/development') : require('./assets/production');

let config = {
    isDevLocal,
    assets,
    getJavaScriptAssets,
    getCSSAssets,
    appVersion: '0.1.1',
    logAllErrors: true,
    testNet: true,
    app: {
        title: 'Trajans Marketplace',
        description: 'A market place for Bitcoin',
        keywords: 'Marketplace, Trajans'
    },
    server: {
        port: 3000,
        sessionSecret: ''
    },
    db: {
        host: 'localhost',
        port: 27017,
        name: 'trajans',
        username: '',
        password: ''
    },
    email: {
        useStubs: false,
        from: 'noreply@tranjans.market',
        options: {
            host: 'smtp.mandrillapp.com',
            port: 587,
            auth: {
                user: 'kahn.hood@gmail.com',
                pass: 'OaizhwvthLKLVAj1F7n2DA'
            }
        }
    },
    payment: {
        useStubs: false,
        stubPaymentTime: 10
    }
};

function tryReadConfigFile(path) {
    try {
        return fs.readJsonSync(path);
    } catch (err) {
        return {};
    }
}

function loadEnvVars(config) {
    // if (process.env.PARSE_SERVER_URL) {
    //     config.parseServerUrl = process.env.PARSE_SERVER_URL;
    // }
}

let defaultFile = tryReadConfigFile(pathHelper.getDataRelative('config.json'));
Object.assign(config, defaultFile);

let localFile = tryReadConfigFile(pathHelper.getLocalRelative('config.local.json'));
Object.assign(config, localFile);

loadEnvVars(config);

if (logConfig) {
    console.log('App configuration:');
    console.log(JSON.stringify(config, null, 2));
}

function getJavaScriptAssets(includeTests = false) {
    let result = pathHelper.getGlobbedFiles(assets.lib.js.concat(assets.js));

    result = result.map((file) => {
        return file.replace('public/', '');
    });

    // To include tests
    if (includeTests) {
        result = _.union(result, this.getGlobbedFiles(assets.tests));
    }

    return result;
}

function getCSSAssets() {
    let result = pathHelper.getGlobbedFiles(assets.lib.css.concat(assets.css));

    result = result.map((file) => {
        return file.replace('public/', '');
    });

    return result;
}

export default config;
