// TODO: use the mongodb object id generator and matcher
// http://stackoverflow.com/questions/20988446/regex-for-mongodb-objectid
// https://github.com/mongodb/bson-ruby/blob/master/lib/bson/object_id.rb#L369
define([], function () {
	'use strict';

	var regex = /^[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

	return function (suid) {
		if (arguments.length > 0) {
			return suid && regex.test(suid);
		} else {
			var s4 = function () {
				return Math.floor((1 + Math.random()) * 0x10000)
					.toString(16)
					.substring(1);
			};
			return s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
		}
	};

});
