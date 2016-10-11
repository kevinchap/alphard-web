define(['q', 'alphard/xhr'], function (Q, XHR) {
	'use strict';

	var get = function (endpoint, parameters, options) {
		var url = endpoint;
		if (parameters)
			url += '?' + toQueryString(parameters);
		return request('GET', url, options);
	};

	var post = function (endpoint, parameters, options) {
		return request('POST', endpoint, parameters, options);
	};

	var request = function (method, endpoint, parameters, options) {
		var deferred = Q.defer();
		var req = new XHR();

		if ( 'withCredentials' in req ) {

			req.withCredentials = !!options.withCredentials;

			req.onreadystatechange = function() {

				if ( req.readyState !== 4 ) {
					return;
				}

				if ( [ 200, 304 ].indexOf( req.status ) === -1 ) {
					deferred.reject( new Error( req.statusText ) );
				} else {
					deferred.resolve( req.responseText );
				}

			};

			if ( req.ontimeout ) {
				req.ontimeout = function() {
					deferred.reject( new Error( event.target.statusText ) );
				};
			}

			if ( req.onerror ) {
				req.onerror = function( error ) {
					deferred.reject( error );
				};
			}

			req.open( method, endpoint, true );

			for (var header in options.headers) {
				if (options.headers.hasOwnProperty(header))
					req.setRequestHeader(header, options.headers[header]);
			}


		} else if ( typeof XDomainRequest != 'undefined' ) {

			req = new XDomainRequest();

			req.onload = function() {

				deferred.resolve( req.responseText );

			};

			req.open( method, endpoint );

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
