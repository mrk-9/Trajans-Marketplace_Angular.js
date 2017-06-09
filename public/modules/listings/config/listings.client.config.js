'use strict';

// Configuring the Articles module
angular.module('listings').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Listings', 'listings', 'dropdown', '/listings(/create)?');
		Menus.addSubMenuItem('topbar', 'listings', 'New Listing', 'listings/create');
	}
]);