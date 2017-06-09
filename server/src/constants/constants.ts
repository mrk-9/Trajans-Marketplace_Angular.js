const url = 'http://localhost:3000/#!';

const escrowStatuses: any =  {
    'a': 'ALL',
    'pa': 'PAID',
    'p': 'UNPAID',
    'ep': 'ESCROW PAID',
    'co': 'COMPLETE',
    'ca': 'CANCELLED',
    'swok': 'SIGNED WITH ONE KEY',
    'rr': 'REFUND REQUESTED',
    'ra': 'REFUND APPROVED',
    'rc': 'REFUND CANCELLED',
    'epp': 'PARTIALLY PAID'
};

const featuredStatuses: any = {
    'pending': 'Pending',
    'active': 'Active',
    'partiallyPaid': 'Partially Paid',
    'cancelled': 'Cancelled',
    'expired': 'Expired'
};

const escrowTypes: any = {
    'n': 'NORMAL',
    'f': 'FEATURED MERCHANT'
};

const ourFees: any = {
    'business': 0.02,
    'businessplus': 0.01
};

const escrowFee: number = 0.01;
const escrowFeeReferal: number = 0.02;
const escrowReferal: number = 0.02;
const paymentAmount: number = 0.99;
const feeAddress: string = '1792FBAVdmw1pmJMmGMNSh9FkBG22CEY1K';
const transactionFee: number = 10000;
const escrowExpiresMultisig: number = -1440; // 25 Hours in minutes
const escrowExpiresCoinjar: number = -15; // 15 minutes
const escrowBitpos: number = -5; // 5 minutes
const confirmations: number = 0;
const featuredMerchantCost: number = 19;

// Bitpost Constants

const bitPosBaseUrl: string = 'https://rest.test.bitpos.me';
const orderUrl: string = '/services/webpay/order/create';
const bitposOrderStatus: string = 'https://rest.test.bitpos.me/services/webpay/order/status/';
const tickerUsername: string = 'hello@trajans.market';
const tickerPassword: string = 'Zykalee001';

const currencies: [string] = ['AUD', 'NZD', 'USD', 'EUR', 'CAD', 'GBP', 'CHF', 'HKD', 'SGD', 'JPY'];

const awsUsername: string = 'AKIAI2G72G3S336ZUH6A';
const awsPassword: string = '34/mNxskNtiiEzxDLZ7r5CGZmKYk/dO+bZHT78ql';
const mediumBlogUrl: string = 'https://medium.com/feed/@Trajans.Market';

export default {
    escrowStatuses,
    featuredStatuses,
    escrowTypes,
    ourFees,
    escrowFee,
    escrowFeeReferal,
    escrowReferal,
    paymentAmount,
    feeAddress,
    transactionFee,
    escrowExpiresMultisig,
    escrowExpiresCoinjar,
    escrowBitpos,
    confirmations,
    featuredMerchantCost,
    bitPosBaseUrl,
    orderUrl,
    bitposOrderStatus,
    tickerUsername,
    tickerPassword,
    successUrl,
    failUrl,
    currencies,
    awsUsername,
    awsPassword,
    mediumBlogUrl
}

function successUrl(orderId: number): string {
    return url + '/dashboard/buying/' + orderId;
}

function failUrl(orderId: number): string {
    return url + '/dashboard/buying/' + orderId + '?fail=true';
}
