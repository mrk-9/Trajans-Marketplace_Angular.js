// jshint ignore: start

const script = require('./scripts/resetUserPasswords');

script
    .run()
    .then(() => {
        console.log('Done!');
    })
    .catch((err) => {
        console.log(err);
    });
