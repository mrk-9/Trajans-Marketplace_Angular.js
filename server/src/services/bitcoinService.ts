import * as request from 'superagent';
import constants from '../constants/constants';

export default {
    getRate
};

function getRate(currency, length = 0) {
    let url = 'https://rest.bitpos.me/services/webpay/currency/rate/' + currency;
    let username = constants.tickerUsername;
    let password = constants.tickerPassword;

    return request
        .get(url)
        .auth(username, password);
}
