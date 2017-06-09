'use strict';

//Admin service used for communicating with the admin REST endpoints
angular.module('admin').factory('Admin', ['$resource',
    function($resource) {
      return {
				users : $resource('admin/users/:userAdminId', { userAdminId: '@_id'}, {
					get: { method: 'GET', params: {}, isArray: false }
				}),
				adminUserUpdate : $resource('admin/updateuser/', {}, {
					update: {
						method: 'PUT'
					}
				}),
				escrowInformation : $resource('admin/escrowinformation/:escrowId', { escrowId: '@_id'}, {
					query: { method: 'GET', params: {}, isArray: false }
				}),
				releaseFundsToAddress : $resource('admin/releasefundstoaddress/', {}, {
				}),
				releaseFundsToSeller : $resource('admin/releasefundstoseller/', {}, {
				}),
		    	transactions : $resource('admin/transactions', {}, {
					query: { method: 'GET', params: {}, isArray: true }
				}),
				documents : $resource('admin/users/documents/:userDocId', {userDocId: '@_id'}, {

				}),
				siteDefaults : $resource('admin/siteDefaults/', {}, {
					get: { method: 'GET', params: {}, isArray: false }
				}),
				typewriter : $resource('admin/typewriter/', {}, {
					update: {
						method: 'PUT'
					}
				}),
				bannerStyles: $resource('admin/banner/', {}, {
					update: {
						method: 'PUT'
					}
				})
      };
    }
]);
