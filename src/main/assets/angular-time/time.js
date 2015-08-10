/*global define*/
define(['module', 'angular'], function (module, angular) {
  'use strict';

  return angular
    .module(module.id, [])

  /**
   * Time Service provider
   *
   * Usage:
   *
   * $time.now()//=> number current timestamp
   */
    .provider("$time", function $timeProvider() {

      this.$get = [function () {
        /**
         * $time module
         */
        var $time;
        (function ($time) {
          var __now = Date.now || function () { return (new Date()).getTime(); };

          /**
           * @return {number} the current timestamp
           */
          function now() {
            return __now();
          }
          $time.now = now;

        }($time || ($time = {})));

        return $time;
      }];

    });
});
