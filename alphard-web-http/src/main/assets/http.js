define(['q', 'xhr'], function (Q, XHR) {
	'use strict';

	var get = function (endpoint, parameters, headers) {
		var url = endpoint;
		if (parameters)
			url += '?' + toQueryString(parameters);
		return request('GET', url, headers);
	};

	var post = function (endpoint, parameters, headers) {
		return request('POST', endpoint, parameters, headers);
	};

	var request = function (method, endpoint, parameters, headers) {
		var deferred = Q.defer();
		var req = new XHR();

		req.onreadystatechange = function () {
			if (req.readyState !== 4) {
				return;
			}

			if ([200, 304].indexOf(req.status) === -1) {
				deferred.reject(new Error(req.statusText));
			} else {
				deferred.resolve(req.responseText);
			}
		};

		req.ontimeout = function () {
			deferred.reject(new Error(event.target.statusText));
		};

		req.onerror = function (error) {
			deferred.reject(error);
		};

		req.open(method, endpoint, true);

		for (var header in headers) {
			if (headers.hasOwnProperty(header))
				req.setRequestHeader(header, headers[header]);
		}

		req.send(parameters || null);

		return deferred.promise;
	};

	var toQueryString = function (obj) {
		var qs = '';
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (qs !== '') {
					qs += '&';
				}
				qs += key + '=' + encodeURIComponent(obj[key]);
			}
		}
		return qs;
	};

	return {
		get: get,
		post: post
	};

});
