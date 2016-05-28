define(['module'], function (module) {
  'use strict';

  var noop = function () {
  };

  var config = (module.config && module.config()) || {};
  var levels = {
    'log': 5,
    'debug': 4,
    'info': 3,
    'warn': 2,
    'error': 1,
    'off': 0
  };
  var defaultLevel = levels.hasOwnProperty(config.defaultLevel) && config.defaultLevel || 'log';
  var defaultPriority = levels[defaultLevel];
  var callbacks = config.callbacks || {};
  for (var level in levels) {
    if (levels.hasOwnProperty(level) && !callbacks[level]) {
      callbacks[level] = noop;
    }
  }

  return function (name, loggerLevel) {
    var logger = {};
    logger.name = name;
    logger.level = levels.hasOwnProperty(loggerLevel) && loggerLevel || defaultLevel;
    logger.priority = Math.min(levels[logger.level], defaultPriority);

    var prefix = '[' + name + ']';
    var con = window.console;
    for (var level in levels) {
      if (levels.hasOwnProperty(level)) {
        if (con && con[level] && levels[level] <= logger.priority)
          logger[level] = con[level].bind(con, prefix);
        else
          logger[level] = noop;
      }
    }

    return logger;
  };
});