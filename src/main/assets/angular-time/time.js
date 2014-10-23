/*global define*/
define(['module', 'angular'], function (module, angular) {
  'use strict';
  return angular
    .module(module.id, [])
    .provider("$time", function $timeProvider() {

      this.$get = [function () {
        var $time = {};

        $time.now = Date.now || function () { return (new Date()).getTime(); };

        return $time;
      }];
      
    });
});
