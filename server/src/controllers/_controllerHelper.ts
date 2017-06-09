import logger from '../services/loggerService';
import config from '../config/config';

export default {
    sendData,
    sendFailureMessage,
    getErrorMessage,
    reqLogin
}

function sendData(data, res) {
    res.jsonp(data);
}

function sendFailureMessage(err, res) {
    if (config.logAllErrors) logger.error(err);
    
    return res.status(400).send({
        message: getErrorMessage(err)
    });
}

function getErrorMessage(err: any): string {
    let message = '';

    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = getUniqueErrorMessage(err);
                break;
            default:
                message = 'Something went wrong';
        }
    } else if (err.message) {
        message = err.message;
    } else {
        for (let errName of err.errors) {
            if (err.errors[errName].message) {
                message += err.errors[errName].message + ' | ';
            }
        }

        message = message.toString();
    }

    return message;
}

function getUniqueErrorMessage(err: any): string {
    let output = '';

    try {
        let fieldName = err.err.substring(err.err.lastIndexOf('.$') + 2, err.err.lastIndexOf('_1'));
        output = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists!!';

    } catch(ex) {
        output = 'Unique field already exists!!';
    }

    return output;
}

function reqLogin(req, user) {
    return new Promise((resolve, reject) => {
        req.login(user, (err) => {
            if (err) return reject(err);

            return resolve(user);
        });
    });
}
