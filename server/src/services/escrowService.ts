import constants from '../constants/constants';
let escrowStatuses = constants.escrowStatuses;

export default {
    escrowStatus
}

function escrowStatus(amount, balance) {
    var status;
    if (!balance) {
        status = escrowStatuses.p;
        balance = 0;
    } else {
        if (balance && (balance >= amount)) {
            status = escrowStatuses.ep;
        } else if (balance && (balance < amount)) {
            status = escrowStatuses.epp;
        } 
    }
    return {
        status: status,
        balance: balance
    };
};
