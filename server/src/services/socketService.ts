import * as mongoose from 'mongoose';
import * as Bitpos from 'bitpos-node';
import * as dateFns from 'date-fns';

import constants from '../constants/constants';
import config from '../config/config';
import bitcoreFactory from '../factory/bitcoreFactory';
import escrowRepository from '../repositories/escrowRepository';
import userRepository from '../repositories/userRepository';

let Order = mongoose.model('Order');
let Escrow = mongoose.model('Escrow');
let Text = mongoose.model('Text');
let Conversation = mongoose.model('Conversation');
let User = mongoose.model('User');
let Featured = mongoose.model('Featured');

export default {
    init
}

function balanceCallback(address, escrowId, req, io) {
    Escrow.findById(escrowId, function (err, escrow) {
        if (err) return err;
        if (escrow) {
            if (address.balance >= escrow.amount) {
                io.sockets.in(req.orderId).emit('balance', {
                    balance: address.balance,
                    paid: 'ESCROW PAID',
                    hasPaid: true
                });
            } else {
                io.sockets.in(req.orderId).emit('balance', {
                    balance: address.balance,
                    paid: address.balance > 0 ? 'PARTIALLY PAID' : 'UNPAID',
                    hasPaid: false
                });
            }
        }
    });
}

function updateBitposOrder(bitpos, address, io, order) {
    Order.findById(order._id, function (err, order) {
        if (err) return err;
        if (order) {
            order.status = bitpos.status;
            if (bitpos.status === 'PARTIAL_RECEIVED_BROADCAST') {
                order.status = 'PAID';
            }
            order.bitposBalance = address.balance;
            order.save(function () {
                io.sockets.in(order._id.toString()).emit('bitposOrderStatus', {
                    order: order,
                    bitpos: bitpos,
                    balance: address.balance
                });
            });
        }
    });
}

function updateDirectOrder(orderId, status) {
    Order.findById(orderId, function (err, order) {
        if (err) return err;
        if (order) {
            order.status = status;
            order.save();
        }
    });
}

async function getAddressBalance(req, io) {
    if (!req.address || !req.orderId) return;

    try {
        let address = await bitcoreFactory.getUtxos(req.address);

        let escrow = await escrowRepository.getEscrowById(req.escrowId, true);

        if (!escrow) return;

        let fullyPaid = address.balance >= escrow.amount;

        if (config.payment.useStubs && config.isDevLocal) {
            let now = new Date();
            let diffSeconds = dateFns.differenceInSeconds(now, escrow.order.created);

            if (diffSeconds > config.payment.stubPaymentTime) {
                fullyPaid = true;
            }
        }

        if (fullyPaid) {
            if (escrow.order.escrowSimple) {
                io.sockets.in(req.orderId).emit('balance', {
                    balance: address.balance,
                    paid: 'PAYMENT RECEIVED',
                    hasPaid: true
                });
                escrow.status = 'PAYMENT RECEIVED';
                escrow.balance = address.balance;

                await escrow.save();

                updateDirectOrder(escrow.order._id, escrow.status);
            } else {
                io.sockets.in(req.orderId).emit('balance', {
                    balance: address.balance,
                    paid: 'ESCROW PAID',
                    hasPaid: true
                });
            }

        } else {
            io.sockets.in(req.orderId).emit('balance', {
                balance: address.balance,
                paid: address.balance > 0 ? 'PARTIALLY PAID' : 'UNPAID',
                hasPaid: false,
                utxos: address.utxos ? address.utxos : null
            });
            escrow.status = address.balance > 0 ? 'PARTIALLY PAID' : 'UNPAID';
            escrow.balance = address.balance;

            await escrow.save();

            updateDirectOrder(escrow.order._id, escrow.status);
        }
    } catch (err) {
        //TODO
        console.log(err);
    }
}

async function getBalanceFeatured(req, io) {
    try {
        let featured = await Featured.findById(req.roomId);

        if (featured && featured.status !== constants.featuredStatuses.active) {
            let address = await bitcoreFactory.getUtxos(req.address);

            let hasPaid = false;

            if (address.balance > 0 && address.balance < featured.amount) {
                featured.status = constants.featuredStatuses.partiallyPaid;
            }

            if (address.balance > 0 && address.balance >= featured.amount) {
                featured.status = constants.featuredStatuses.active;

                await userRepository.updateFeaturedMerchant(req.userId);

                hasPaid = true;
            }

            featured = await featured.save();

            io.sockets.in(req.roomId).emit('balance', {
                balance: address.balance,
                utxos: address.utxos ? address.utxos : null,
                paid: hasPaid,
                status: featured.status
            });
        } else {
            io.sockets.in(req.roomId).emit('balance', {
                expired: true
            });
        }
    } catch (err) {
        //TODO
        console.log(err);
    }
}

function init(io) {
    // SOCKET IO CONFIGURATION AND ESCROW
    io.on('connection', function (socket) {
        //Join conversation room
        socket.on('joinConversationRoom', function (id) {
            socket.join(id);
        });

        // Join the order room
        socket.on('joinOrderRoom', function (req) {
            socket.join(req.orderId);
        });

        socket.on('leaveOrderRoom', function (req) {
            socket.leave(req.orderId);
        });

        socket.on('joinRoom', function (req) {
            socket.join(req.id);
        });

        socket.on('leaveRoom', function (req) {
            socket.leave(req.id);
        });

        socket.on('getBalanceFeatured', (req) => getBalanceFeatured(req, io));

        // Get the multisig escrow balance
        socket.on('getAddressBalance', (req) => getAddressBalance(req, io));

        // Probe Bitpos Order
        socket.on('probeBitposOrder', function (req) {
            Order.findById(req.orderId)
                .populate('seller')
                .exec(function (err, order) {
                    if (err) {
                        console.log(err);
                        return err;
                    } else {
                        if (order && order.seller) {
                            var bp = new Bitpos({
                                username: order.seller.bitposUsername,
                                password: order.seller.bitposPassword,
                                live: true
                            });
                            bp.status(order.bitposEncodedOrderId, function (err, response) {
                                if (!err && response) {
                                    var address = bitcoreFactory.getBitPosBalance(response, response.address, order, io, updateBitposOrder);
                                }
                            });
                        }
                    }
                });
        });

        // Send a conversation message 
        socket.on('newMessage', function (body) {
            var from, to, message, id, userId, userName;
            message = body.message;
            to = body.to;
            userId = body.userId;
            userName = body.userName;
            id = body.id;
            Conversation.findById(id, function (err, conversation) {
                if (err) {
                    io.sockets.in(id).emit('newMessageError', {
                        success: false,
                        error: 'Error sending message',
                        data: null
                    });
                } else {
                    if (userId.toString() === conversation.from.toString() || userId.toString() === conversation.to.toString()) {
                        from = userId;
                        var newMessage = new Text({
                            to: to,
                            from: from,
                            message: message
                        });
                        newMessage.save(function (err, message) {
                            if (err) {
                                io.sockets.in(id).emit('newMessageError', {
                                    success: false,
                                    error: 'Error sending message',
                                    data: null
                                });
                            } else {
                                conversation.messages.push(message);
                                conversation.save(function (err, conversation) {
                                    if (err) {
                                        io.sockets.in(id).emit('newMessageError', {
                                            success: false,
                                            error: 'Error sending message',
                                            data: null
                                        });
                                    } else {
                                        var room = io.sockets.adapter.rooms[id];
                                        if (room) {
                                            if (Object.keys(room).length < 2) {
                                                console.log('Send Email');
                                            }
                                        }
                                        io.sockets.in(id).emit('newMessageSuccess', {
                                            success: true,
                                            errors: null,
                                            data: {
                                                conversation: conversation,
                                                message: message,
                                                from: userName
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        io.sockets.in(id).emit('newMessageError', {
                            success: false,
                            error: 'Error sending message',
                            data: null
                        });
                    }
                }
            });
        });
    });
};
