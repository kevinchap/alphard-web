define(['module'], function (module) {
  'use strict';

  var config = (module.config && module.config()) || {};
  var onDebug = config.onDebug || function () {
    };
  var onInfo = config.onInfo || function () {
    };
  var onWarn = config.onWarn || function () {
    };
  var onError = config.onError || function () {
    };
  var onFatal = config.onFatal || function () {
    };

  return function (self, name, isDebug) {
    var prefix = '[' + name + ']';
    var log = function (onLog, fatal) {
      return function () {
        var args = [prefix];
        for (var i = 0, l = arguments.length; i < l; i++) {
          args.push(arguments[i]);
        }
        if (fatal) {
          onLog(args);
          throw new Error(args);
        } else
          return onLog(args);
      };
    };

    var cons = console;
    var debug;
    if (isDebug) {
      debug = log(function (args) {
        try {
          onDebug.apply(self, args);
        } catch(exception) {
          cons.warn.apply(self, [prefix, 'onDebug hook failed', exception]);
        }
        return cons.debug.apply(self, args);
      });
    } else {
      debug = function () {
      };
    }
    var info = log(function (args) {
      try {
        onInfo.apply(self, args);
      } catch(exception) {
        cons.warn.apply(self, [prefix, 'onInfo hook failed', exception]);
      }
      return cons.info.apply(self, args);
    });
    var warn = log(function (args) {
      try {
        onWarn.apply(self, args);
      } catch(exception) {
        cons.warn.apply(self, [prefix, 'onWarn hook failed', exception]);
      }
      return cons.warn.apply(self, args);
    });
    var error = log(function (args) {
      try {
        onError.apply(self, args);
      } catch(exception) {
        cons.warn.apply(self, [prefix, 'onError hook failed', exception]);
      }
      return cons.error.apply(self, args);
    });
    var fatal = log(function (args) {
      try {
        onFatal.apply(self, args);
      } catch(exception) {
        cons.warn.apply(self, [prefix, 'onFatal hook failed', exception]);
      }
      return cons.error.apply(self, args);
    }, true);

    return {
      debug: debug,
      info: info,
      warn: warn,
      error: error,
      fatal: fatal
    };
  };
});