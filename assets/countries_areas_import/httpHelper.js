'use strict';

var axios = require('axios');

exports.httpGet = function (url) {
    return axios.get(url)
        .then(function (response) {
            return response.data;
        });
};
