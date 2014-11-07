/*global define*/
define(['module', 'angular'], function (module, angular) {
  'use strict';
  return angular
    .module(module.id, [])
    .provider("$time", function $timeProvider() {

      this.$get = [function () {
        /**
         * $time module
         */
        var $time = (function () {
          var __now = Date.now || function () { return (new Date()).getTime(); };

          /**
           * @return {number}
           */
          function now() {
            return __now();
          }

          //exports
          return {
            now: now
          };
        }());

        return $time;
      }];

    });
});
