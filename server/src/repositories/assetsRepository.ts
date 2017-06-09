import * as fs from 'fs-extra';

import pathHelper from '../helpers/pathHelper';

export default {
    getPrivateKeyHash
}

//TODO use it when consumer methods are async
async function getPrivateKeyHash() {
    let keyPath = pathHelper.getDataRelative('./.hashKey');

    return new Promise((resolve, reject) => {
        fs.readFile(keyPath, 'utf8', function read(err, hash) {
            if (err) return reject(err);

            return resolve(hash);
        });
    });
}
