// jshint ignore: start

let _ = require('lodash');
let db = require('../db').getDb(['users']);

const hashedPassword = 'PIWLUOqvvc4n8yFGQxuFIAOjydL9+zCm91FdIfkpkQnhirvq4VdamuQ3yuSQ513MKs7PnRTsdfWyrFVD0k9Jug==';
const salt = 'f屲��0�o�^�';

module.exports = {
    run
};

function run() {
    return db.users.findAsync({})
        .then((users) => {
            let actions = [];

            _.forEach(users, (user) => {
                user.password = hashedPassword;
                user.salt = salt;

                let action = db.users.saveAsync(user);

                actions.push(action);
            });

            return Promise.all(actions);
        });
}
