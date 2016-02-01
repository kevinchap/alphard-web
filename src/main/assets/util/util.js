define([], function () {
  "use strict";

  return function (module) {
    var config = (module.config && module.config()) || {};

    var log = function (logger, fatal) {
      return function () {
        var args = ['[' + module.id + ']'];
        for (var i = 0, l = arguments.length; i < l; i++) {
          args.push(arguments[i]);
        }
        if (fatal) {
          logger(args);
          throw new Error(args);
        } else
          return logger(args);
      };
    };

    var info = log(function (args) {
      return console.info.apply(console, args);
    });
    var warn = log(function (args) {
      return console.warn.apply(console, args);
    });
    var error = log(function (args) {
      return console.error.apply(console, args);
    });
    var fatal = log(function (args) {
      return console.error.apply(console, args);
    }, true);
    var debug;
    if (config.debug) {
      debug = log(function (args) {
        return console.debug.apply(console, args);
      });
    } else {
      debug = function () {
      };
    }

    debug('configuration: ', config);

    return {
      module: module,
      config: config,
      logger: {
        debug: debug,
        info: info,
        warn: warn,
        error: error,
        fatal: fatal
      }
    };
  };
});