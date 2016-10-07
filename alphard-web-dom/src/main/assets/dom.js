define([], function () {
	'use strict';

	return function (html) {
		var div = document.createElement('div');
		div.innerHTML = html;
		return div.childNodes;
	};

});
