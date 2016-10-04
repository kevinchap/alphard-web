define(['module', 'http', 'uuid'], function (module, http, uuid) {
	'use strict';

	return function (endpoint, method, params, id, version) {
		return http.post(endpoint, JSON.stringify({
			id: id || uuid(),
			jsonrpc: version || '2.0',
			method: method,
			params: params
		}), {
			'Content-Type': 'application/json'
		}).then(function (rawResponse) {
			var response = JSON.parse(rawResponse);
			if (response.error) {
				throw new Error(response.error.message + ': ' + response.error.data);
			} else {
				return response.result;
			}
		});
	};

});
