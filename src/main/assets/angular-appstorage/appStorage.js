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

  function exports() {
    return angular
      .module(module.id, [ ngWebStorage.name ])
      .provider({
        $appStorageFactory: $appStorageFactoryProvider,
        $appLocalStorage: $appStorageProvider("local"),
        $appSessionStorage: $appStorageProvider("session"),
        $appMemoryStorage: $appStorageProvider("memory")
      });
  }

  function $appStorageFactoryProvider() {
    /*jslint validthis:true*/
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
          //$storage.$onChange(pull);
          $rootScope.$on('$' + type + '.onchange', pull);
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
            //$storage.$sync();
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

  }

  function $appStorageProvider(type) {

    return function $provider() {
      this.$get = ['$appStorageFactory', '$rootElement',
      function ($appStorageFactory, $rootElement) {
        var appName = $rootElement.attr("ng-app") || "ngApp";
        return $appStorageFactory(appName, type);
      }];
    };
  }

  //exports
  return exports();
});
