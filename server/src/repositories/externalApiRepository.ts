import axios from 'axios';
import constants from '../constants/constants';
import config from '../config/config';
const parseString = require('xml2js').parseString;

export default {
    getBlogPosts,
    getUtxos,
    getCoinCapGlobal,
    getRateToConvertUSDtoAUD
}

async function getBlogPosts() {
    let result = [];

    let response = await axios.get(constants.mediumBlogUrl);

    let data = response.data;

    let xmlResult: any = await parseXml(data);

    if (!xmlResult || !xmlResult.rss.channel[0].item.length) return result;

    for (let item of xmlResult.rss.channel[0].item) {
        let resultItem = {
            title: item.title[0],
            description: '',
            pubDate: item.pubDate[0],
            link: item.link[0]
        };

        if (item.description) {
            resultItem.description = item.description[0];
        }

        result.push(resultItem);
    }

    return result;
}

function parseXml(str) {
    return new Promise((resolve, reject) => {
        parseString(str, { trim: true, cdata: true }, (err, result) => {
            if (err) return reject(err);

            return resolve(result);
        })
    });
}

async function getUtxos(address) {
    let url = '';

    if (config.testNet) {
        url = 'https://test-insight.bitpay.com/api/addr/' + address + '/utxo?noCache=1';
    } else {
        url = 'https://insight.bitpay.com/api/addr/' + address + '/utxo?noCache=1';
    }

    let response = await axios.get(url + address);

    return response.data;
}

async function getCoinCapGlobal() {
    let url = 'http://www.coincap.io/global';

    let response = await axios.get(url);

    return response.data;
}

async function getRateToConvertUSDtoAUD() {
    let url = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20(%22USDAUD%22)&format=json&env=store://datatables.org/alltableswithkeys&callback=';

    let response = await axios.get(url);

    return response.data;
}
