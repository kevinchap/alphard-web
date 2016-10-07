define([], function () {
	'use strict';

	var parameters = {};
	var query = window.location.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		// If first entry with this name
		if (typeof parameters[pair[0]] === 'undefined') {
			parameters[pair[0]] = decodeURIComponent(pair[1]);
			// If second entry with this name
		} else if (typeof parameters[pair[0]] === 'string') {
			parameters[pair[0]] = [parameters[pair[0]], decodeURIComponent(pair[1])];
			// If third or later entry with this name
		} else {
			parameters[pair[0]].push(decodeURIComponent(pair[1]));
		}
	}
	return parameters;

});

