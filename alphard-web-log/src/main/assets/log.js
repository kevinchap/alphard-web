define(['module'], function (module) {
	'use strict';

	var noop = function () {};

	// IE 9 Quick Hack

	// var noop = function (p1, p2, p3, p4) {
	// 	console.log(p1, p2, p3, p4);
	// };

	var config = (module.config && module.config()) || {};
	var levels = {
		'log': 5,
		'debug': 4,
		'info': 3,
		'warn': 2,
		'error': 1,
		'off': 0
	};
	var defaultLevel = levels.hasOwnProperty(config.level) && config.level || 'log';
	var defaultPriority = levels[defaultLevel];

	return function (nameOrModule, logLevel) {
		var name = 'default';
		if (typeof nameOrModule === 'string') {
			name = nameOrModule;
		}
		else if (typeof nameOrModule === 'object') {
			name = nameOrModule.id || name;
			config = (nameOrModule.config && nameOrModule.config()) || {};
			logLevel = config.logLevel || config.debug && 'debug' || 'info';
		}

		var logger = {};
		logger.name = name;
		logger.level = levels.hasOwnProperty(logLevel) && logLevel || defaultLevel;
		logger.priority = Math.min(levels[logger.level], defaultPriority);

		var prefix = '[' + name + ']';
		var con = window.console;
		for (var level in levels) {
			if (levels.hasOwnProperty(level)) {

				if (con && con[level] && levels[level] <= logger.priority)
					logger[level] = Function.prototype.bind.call( con[level], con, prefix ); // logger[level] = con[level].bind(con, prefix);
				else
					logger[level] = noop;

				// IE 9 Quick Hack
				//logger[ level ] = noop;

			}
		}

		return logger;
	};
});
