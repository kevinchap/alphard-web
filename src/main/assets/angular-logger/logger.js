define(['module', 'angular'], function (module, angular) {
  'use strict';

  function exports() {
    return angular
      .module(module.id, [])
      .provider({
        $logger: $loggerProvider
      });
  }

  function $loggerProvider() {

    this.$get = [ '$log', function ($log) {
      var __void = function () {};
      var __aslice = [].slice;

      function $logger(name, debug) {
        return {
          debug: debug ?
            function () {
              $log.debug.apply($log, _formatMessage(name, arguments));
            } :
            __void,
          warn: function () {
            $log.warn.apply($log, _formatMessage(name, arguments));
          },
          error: function () {
            $log.error.apply($log, _formatMessage(name, arguments));
          }
        }
      }

      function _formatMessage(name, args) {
        return name ? ["[" + name + "]"].concat(__aslice.call(args)) : args;
      }
      return $logger;
    }];

  }

  return exports();
});
