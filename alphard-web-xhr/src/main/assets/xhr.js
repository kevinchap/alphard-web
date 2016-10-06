define(['module', 'alphard/log'], function (module, log) {
	'use strict';

	var logger = log(module);
	var XHR = function () {
		logger.error('XMLHttpRequest is not supported by your browser!');
	};
	if (window.XMLHttpRequest) {
		XHR = XMLHttpRequest;
	} else if (window.ActiveXObject) {
		try {
			XHR = function () {
				return new window.ActiveXObject('Msxml2.XMLHTTP');
			};
		} catch (e) {
			XHR = function () {
				return new window.ActiveXObject('Microsoft.XMLHTTP');
			};
		}
	} else {
		logger.warn('XMLHttpRequest is not supported by your browser!');
	}
	return XHR;

});
