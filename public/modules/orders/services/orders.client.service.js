'use strict';

//Orders service used to communicate Orders REST endpoints
angular.module('orders').factory('Orders', ['$resource',
	function($resource) {
		return {
			orderId : $resource('orders/:orderId', { orderId: '@_id'}, {
				update: {
					method: 'PUT'
				}
			}),
			userOrders : $resource('userorders', {}, {
				query: { method: 'GET', params: {}, isArray: true }
			}),
			userSellerOrders : $resource('usersellerorders', {}, {
				query: { method: 'GET', params: {}, isArray: true }
			}),
			totalSellerCompletedOrders : $resource('usersellerorders/completed/:sellerId', {
				sellerId: '@_id'
			}, {
				query: { method: 'GET', params: {}, isArray: true }
			}),
			getOrders : $resource('getorders', {}, {
				query: { method: 'GET', params: {}, isArray: true }
			}),
			pendingOrders : $resource('pendinguserorders', {}, {
				query: { method: 'GET', params: {}, isArray: true }
			}),
			bitcoinEscrowOrder : $resource('bitcoinescroworder'),
			bitPosOrder : $resource('bitposorder'),
			directOrder : $resource('directorder'),
			bitcoinEscrowPaid : $resource('orderescrowpaid'),
			orderReleaseEscrowPaid : $resource('orderreleaseescrow/:orderEscrowAddress', { orderEscrowAddress: '@_id'}, {
				update: {
					method: 'PUT'
				}
			}),
			markOrderShipped : $resource('markordershipped/:shippingOrderId', { shippingOrderId: '@_id'}, {
				update: {
					method: 'PUT'
				}
			}),
			markOrderNotShipped : $resource('markordernotshipped/:shippingNotOrderId', { shippingNotOrderId: '@_id'}, {
				update: {
					method: 'PUT'
				}
			}),          
			countAllComplete: $resource('/countAllCompleteOrders', {}, {
                query: {
                    method: 'GET',
                    params: {},
                    isArray: false,
                    ignoreLoadingBar: true
                }
            })
		};
	}
]);
