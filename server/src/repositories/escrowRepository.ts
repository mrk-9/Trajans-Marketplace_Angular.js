import * as mongoose from 'mongoose';

import escrowAuditRepository from '../repositories/escrowAuditRepository';
import constants from '../constants/constants';

let Escrow = mongoose.model('Escrow');

export default {
    getEscrowById,
    updateOrderSimpleEscrow,
    createNewEscrow,
    removeEscrow
};

const PAID_STATUS = 'UNPAID';

async function getEscrowById(id, includeOrder = false) {
    if (includeOrder) {
        return await Escrow.findById(id).populate('order');
    }

    return await Escrow.findById(id);
}

async function updateOrderSimpleEscrow(order) {
    let escrow = await getEscrowById(order.multisigEscrow);

    escrow.status = PAID_STATUS;
    escrow.amount = parseFloat(order.bitcoin_amount).toFixed(8);

    return await escrow.save();
}

async function createNewEscrow(order, user, ourFeeBTC, ourFeeFiat, address, privateKey) {
    let escrow = new Escrow({
        order: order,
        buyer: user,
        seller: order.seller,
        amount: parseFloat(order.bitcoin_amount).toFixed(8),
        ourFeeBTC: ourFeeBTC,
        ourFeeFiat: ourFeeFiat,
        privateKey: privateKey,
        escrowAddress: address.publicAddress,
        recipientAddress: order.seller.walletAddress,
        directEscrow : true,
        type: constants.escrowTypes.n
    });

    let escrowAudit = await escrowAuditRepository.createEscrowAudit('Escrow Created', user);

    escrow.escrowAudits.push(escrowAudit);

    return await escrow.save();
}

async function removeEscrow(id) {
    return await Escrow.remove({_id: id});
}
