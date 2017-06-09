'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('core').factory('Escrow', ['$resource', '$q',
    function($resource, $q) {
        return {
            create: $resource('/escrow', {}, {}),
            getEscrows: $resource('/escrow', {}, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: false
                }
            }),
            escrowById: $resource('/escrows/:multisigEscrowId', {
                id: '@_multisigEscrowId'
            }, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: false
                }
            }),
            cancelEscrow: $resource('/cancelescrow', {}, {
                update: {
                    method: 'PUT'
                }
            }),
            getBalance: $resource('/getbalance', {
                escrowId: '@escrowId'
            }, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: false
                }
            }),
            getBalanceDirect: $resource('/getbalancedirect', {
                escrowId: '@escrowId'
            }, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: false
                }
            }),
            signEscrow: $resource('/signescrow', {}, {
                update: {
                    method: 'PUT'
                }
            }),
            signReleaseEscrow: $resource('/signandrelease', {}, {
                update: {
                    method: 'PUT'
                }
            }),
            requestRefund: $resource('/requestrefund', {}, {
                update: {
                    method: 'PUT'
                }
            }),
            confirmRefund: $resource('/confirmrefund', {}, {
                update: {
                    method: 'PUT'
                }
            }),
            cancelRefund: $resource('/cancelrefund', {}, {
                update: {
                    method: 'PUT'
                }
            }),
            buyerRecieved: $resource('/buyerrecieved', {}, {
                update: {
                    method: 'PUT'
                }
            }),
            sellerRecieved: $resource('/sellerrecieved', {}, {
                update: {
                    method: 'PUT'
                }
            }),
            topEarners: $resource('/topearners')
        };
    }
]);