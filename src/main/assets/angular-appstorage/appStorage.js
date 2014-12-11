define([
  'module',
  'angular',
  'angular-webstorage'
], function (
  module,
  angular,
  ngWebStorage
) {
  'use strict';

  function $appStorageProvider(type) {

    return function $provider() {
      this.$get = ['$appStorageFactory', '$rootElement',
      function ($appStorageFactory, $rootElement) {
        var appName = $rootElement.attr("ng-app") || "ngApp";
        return $appStorageFactory(appName, type);
      }];
    };
  }

  return angular
    .module(module.id, [ ngWebStorage.name ])
    .provider("$appStorageFactory", function $appStorageFactoryProvider() {
      var settings = {
        prefix: ""
      };

      this.config = function (data) {
        var result;
        if (arguments.length) {
          angular.extend(settings, data);
          result = this;
        } else {
          result = angular.copy(settings);
        }
        return result;
      };

      this.$get = ['$browser', '$webStorage', '$rootScope',
      function ($browser, $webStorage, $rootScope) {

        function appStorageFactory(name, opt_type) {

          var fullname = settings.prefix + name;
          var type = opt_type || "local";
          var $storage = $webStorage(type);
          var data = {};
          var dataOld = null;

          function init() {
            pull();

            //poll content
            $browser.addPollFn($sync);
            var eventName = '$' + type + 'Storage.change';
            $rootScope.$on(eventName, pull);
            $sync();
          }

          function pull() {
            var storageData = $storage[fullname];
            storageData = storageData ? angular.fromJson(storageData) : null;
            if (!angular.equals(storageData, data)) {
              angular.copy(storageData, data);
              dataOld = angular.copy(storageData);
            }
          }

          function push() {
            if (!angular.equals(dataOld, data)) {
              angular.copy(data, dataOld);
              $storage[fullname] = angular.toJson(data);
            }
          }

          function $sync() {
            push();
          }

          init();
          return data;
        }

        return appStorageFactory;
      }];
    })
    .provider("$appLocalStorage", $appStorageProvider("local"))
    .provider("$appSessionStorage", $appStorageProvider("session"))
    .provider("$appMemoryStorage", $appStorageProvider("memory"));
});
