define(['module', 'alphard/http', 'alphard/uuid'], function (module, http, uuid) {
	'use strict';

	return function (endpoint, method, params, opts) {

		var options = opts || {};
		if (!options.headers) {
			options.headers = {};
		}
		options.headers['Content-Type'] = 'application/json';

		return http.post(endpoint, JSON.stringify({
			id: options.id || uuid(),
			jsonrpc: options.version || '2.0',
			method: method,
			params: params
		}), options).then(function (rawResponse) {
			var response = JSON.parse(rawResponse);
			if (response.error) {
				throw response.error;
			} else {
				return response.result;
			}
		});
	};

});
