/*global define*/
define(['module', 'angular'], function (module, angular) {
  'use strict';

  function exports() {
    return angular
      .module(module.id, [])
      .provider({
        $time: $timeProvider
      });
  }

  function $timeProvider() {
    /*jslint validthis:true */
    this.$get = [function () {
      var $time = {};

      $time.now = Date.now || function () { return (new Date()).getTime(); };

      return $time;
    }];

  }

  return exports();
});
