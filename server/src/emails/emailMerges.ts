export default {
    newUser,
    settingsUpdateRequest,
    settingsUpdatedConfirmation,
    newDirectPaymentOrder,
    newModeratedPaymentOrder,
    newModeratedPaymentReleased,
    newModeratedPaymentInEscrow,
    passwordUpdateRequest,
    passwordUpdated,
    leaveReview,
    reviewReceived,
    shippingStatusUpdated,
    subscriptionCancelled,
    subscriptionConfirmation,
    subscriptionBillDueReminder,
    subscriptionExpiryReminder,
    subscriptionRenewed,
    verifyAccount,
    messageReceived,
    proposal,
    proposalRejected,
    escrowPaid,
    keyRecieved,
    escrowId,
    refundRequested
};

function newUser(recipient) {
    return [{
        'name': 'recipient',
        'content': recipient
    }];
}

function settingsUpdateRequest(recipient, link) {
    return [{
        'name': 'recipient',
        'content': recipient
    },
        {
            'name': 'link',
            'content': link
        }
    ];
}

function settingsUpdatedConfirmation(recipient, time, date) {
    return [{
        'name': 'recipient',
        'content': recipient
    },
        {
            'name': 'time',
            'content': time
        },
        {
            'name': 'date',
            'content': date
        }
    ];
}

function newDirectPaymentOrder(recipient, orderItemsString, orderedFrom, orderId, amount, createdBy) {
    return [{
        'name': 'recipient',
        'content': recipient
    },
        {
            'name': 'orderItemsString',
            'content': orderItemsString
        },
        {
            'name': 'orderedFrom',
            'content': orderedFrom
        },
        {
            'name': 'orderId',
            'content': orderId
        },
        {
            'name': 'amount',
            'content': amount
        },
        {
            'name': 'createdBy',
            'content': createdBy
        },
    ];
}

function newModeratedPaymentOrder(recipient, orderId, orderItemsString, key, amount, address, createdBy,
                                  orderedFrom, encryptionPassword, escrowId) {
    return [{
        'name': 'recipient',
        'content': recipient
    },
        {
            'name': 'orderId',
            'content': orderId
        },
        {
            'name': 'orderItemsString',
            'content': orderItemsString
        },
        {
            'name': 'key',
            'content': key
        },
        {
            'name': 'amount',
            'content': amount
        },
        {
            'name': 'address',
            'content': address
        },
        {
            'name': 'createdBy',
            'content': createdBy
        },
        {
            'name': 'orderedFrom',
            'content': orderedFrom
        },
        {
            'name': 'encryptionPassword',
            'content': encryptionPassword
        },
        {
            'name': 'escrowId',
            'content': escrowId
        }
    ];
}

function newModeratedPaymentReleased(recipient, orderId, address, amount, createdBy, orderedFrom, escrowId) {
    return [{
        'name': 'recipient',
        'content': recipient
    },
        {
            'name': 'orderId',
            'content': orderId
        },
        {
            'name': 'address',
            'content': address
        },
        {
            'name': 'amount',
            'content': amount
        },
        {
            'name': 'createdBy',
            'content': createdBy
        },
        {
            'name': 'orderedFrom',
            'content': orderedFrom
        },
        {
            'name': 'escrowId',
            'content': escrowId
        }
    ];
}

function newModeratedPaymentInEscrow(recipient, amount, orderId, address, createdBy, orderedFrom, escrowId) {
    return [{
        'name': 'recipient',
        'content': recipient
    },
        {
            'name': 'amount',
            'content': amount
        },
        {
            'name': 'orderId',
            'content': orderId
        },
        {
            'name': 'address',
            'content': address
        },
        {
            'name': 'createdBy',
            'content': createdBy
        },
        {
            'name': 'orderedFrom',
            'content': orderedFrom
        },
        {
            'name': 'escrowId',
            'content': escrowId
        }
    ];
}

function passwordUpdateRequest(recipient, resetLink) {
    return [{
        'name': 'recipient',
        'content': recipient
    },
        {
            'name': 'resetLink',
            'content': resetLink
        }
    ];
}

function passwordUpdated(recipient, time, date) {
    return [{
        'name': 'recipient',
        'content': recipient
    },
        {
            'name': 'time',
            'content': time
        },
        {
            'name': 'date',
            'content': date
        }
    ];
}

function leaveReview(recipient, orderId) {
    return [{
        'name': 'recipient',
        'content': recipient
    },
        {
            'name': 'orderId',
            'content': orderId
        }
    ];
}

function reviewReceived(recipient, orderId) {
    return [{
        'name': 'recipient',
        'content': recipient
    },
        {
            'name': 'orderId',
            'content': orderId
        }
    ];
}

function shippingStatusUpdated(recipient, orderId, orderedFrom, orderItemsString) {
    return [{
        'name': 'recipient',
        'content': recipient
    },
        {
            'name': 'orderId',
            'content': orderId
        },
        {
            'name': 'orderedFrom',
            'content': orderedFrom
        },
        {
            'name': 'orderItemsString',
            'content': orderItemsString
        }
    ];
}

function subscriptionCancelled(recipient, plan) {
    return [{
        'name': 'recipient',
        'content': recipient
    },
        {
            'name': 'plan',
            'content': plan
        }
    ];
}

function subscriptionConfirmation(recipient, plan) {
    return [{
        'name': 'recipient',
        'content': recipient
    },
        {
            'name': 'plan',
            'content': plan
        }
    ];
}

function subscriptionBillDueReminder(recipient, plan, billDate, billAmount, subscriptionsLink) {
    return [{
        'name': 'recipient',
        'content': recipient
    },
        {
            'name': 'plan',
            'content': plan
        },
        {
            'name': 'billDate',
            'content': billDate
        },
        {
            'name': 'billAmount',
            'content': billAmount
        },
        {
            'name': 'subscriptionsLink',
            'content': subscriptionsLink
        }
    ];
}

function subscriptionExpiryReminder(recipient, plan, expiryDate) {
    return [{
        'name': 'recipient',
        'content': recipient
    },
        {
            'name': 'plan',
            'content': plan
        },
        {
            'name': 'expiryDate',
            'content': expiryDate
        }
    ];
}

function subscriptionRenewed(recipient, plan) {
    return [{
        'name': 'recipient',
        'content': recipient
    },
        {
            'name': 'plan',
            'content': plan
        }
    ];
}

function verifyAccount(recipient, verificationLink) {
    return [{
        'name': 'recipient',
        'content': recipient
    },
        {
            'name': 'verificationLink',
            'content': verificationLink
        }
    ];
}

function messageReceived(recipient, user) {
    return [{
        'name': 'recipient',
        'content': recipient
    },
        {
            'name': 'user',
            'content': user
        }
    ];
}

function proposal(job, amount, experience, approach, username) {
    return [{
        'name': 'job',
        'content': job
    }, {
        'name': 'amount',
        'content': amount
    }, {
        'name': 'experience',
        'content': experience
    }, {
        'name': 'approach',
        'content': approach
    }, {
        'name': 'username',
        'content': username
    }];
}

function proposalRejected(job, amount, experience, approach, username) {
    return [{
        'name': 'job',
        'content': job
    }, {
        'name': 'amount',
        'content': amount
    }, {
        'name': 'experience',
        'content': experience
    }, {
        'name': 'approach',
        'content': approach
    }];
}

function escrowPaid(orderId, recipientAddress, changeAddress, escrowAddress, amount) {
    return [{
        'name': 'orderId',
        'content': orderId
    }, {
        'name': 'recipientAddress',
        'content': recipientAddress
    }, {
        'name': 'changeAddress',
        'content': changeAddress
    }, {
        'name': 'escrowAddress',
        'content': escrowAddress
    }, {
        'name': 'amount',
        'content': amount
    }];
}

function keyRecieved(orderId, escrowId, username, escrowAddress) {
    return [{
        'name': 'orderId',
        'content': orderId
    }, {
        'name': 'escrowId',
        'content': escrowId
    }, {
        'name': 'username',
        'content': username
    }, {
        'name': 'escrowAddress',
        'content': escrowAddress
    }];
}

function escrowId(recipient, orderId) {
    return [{
        'name': 'recipient',
        'content': recipient
    },
        {
            'name': 'orderId',
            'content': orderId
        }
    ];
}

//TODO are last two params required
function refundRequested(recipient, orderId, createdBy = null, orderedFrom = null) {
    return [{
        'name': 'recipient',
        'content': recipient
    },
        {
            'name': 'createdBy',
            'content': createdBy,
        },
        {
            'name': 'orderedFrom',
            'content': orderedFrom
        },
        {
            'name': 'orderId',
            'content': orderId
        }
    ];
}
