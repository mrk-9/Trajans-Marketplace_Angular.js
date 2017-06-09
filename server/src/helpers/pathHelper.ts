import * as path from 'path';
import * as _ from 'lodash';
import * as glob from 'glob';

let profileData = {
    production: {
        root: '../',
        data: './data',
        local: './local',
        client: './client'
    },
    development: {
        root: '../../..',
        data: './data',
        local: './local',
        client: '../client/build'
    }
};

//TODO for simplicity the same profile data for dev/prod
profileData.production = profileData.development;

let rootPath = getRootPath();

export default {
    path,
    getGlobbedFiles,
    getRelative: getRelativePath,
    getDataRelative: getDataRelativePath,
    getLocalRelative: getLocalRelativePath,
    getClientRelative: getClientRelativePath
};

function getDataRelativePath(...paths) {
    return getRelativePath('data', ...paths)
}

function getLocalRelativePath(...paths) {
    return getRelativePath('local', ...paths)
}

function getClientRelativePath(...paths) {
    return getRelativePath('client', ...paths)
}

function getRelativePath(profileFolder, ...paths: string[]) {
    let folderRelative = profileData[getCurrentProfile()][profileFolder];

    if (!folderRelative) throw Error(`Cannot find relative folder profile '${profileFolder}'`);

    if (profileFolder !== 'root') {
        paths.unshift(folderRelative);
    }

    paths.unshift(rootPath);

    return path.join.apply(this, paths);
}

function getRootPath() {
    let rootRelative = profileData[getCurrentProfile()].root;

    if (!rootRelative) throw Error('Cannot find root folder');

    return path.join(__dirname, rootRelative);
}

function getCurrentProfile(){
    let env = process.env['NODE_ENV'];

    return env ? env : 'development';
}

function getGlobbedFiles(globPatterns) {
    // For context switching
    var _this = this;

    // URL paths regex
    var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

    // The output array
    var output = [];

    // If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob
    if (_.isArray(globPatterns)) {
        globPatterns.forEach(function (globPattern) {
            output = _.union(output, _this.getGlobbedFiles(globPattern));
        });
    } else if (_.isString(globPatterns)) {
        if (urlRegex.test(globPatterns)) {
            output.push(globPatterns);
        } else {
            let files = glob(globPatterns, {sync: true});

            output = _.union(output, files);
        }
    }

    return output;
}
