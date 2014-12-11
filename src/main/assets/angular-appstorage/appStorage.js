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
          /**
           * AppStorage class
           */
          var AppStorage = (function (_super) {
            function AppStorage() {
              _super.call(this);
            }
            AppStorage.prototype = Object.create(_super.prototype);
            AppStorage.prototype.constructor = AppStorage;
            return AppStorage;
          }(Object));
          
          
          var fullname = settings.prefix + name;
          var type = opt_type || "local";
          var $storage = $webStorage(type);
          var data = new AppStorage();
          var dataOld = null;

          function init() {
            pull();

            //poll content
            $browser.addPollFn($sync);
            $rootScope.$on('$' + type + 'Storage.change', function ($event, data) {
              if (data.key === fullname) {
                pull();
              }
            });
            $sync();
          }

          function hasLocalChanges() {
            return !angular.equals(data, dataOld);
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
            if (hasLocalChanges()) {
              angular.copy(data, dataOld);
              $storage[fullname] = angular.toJson(data);
            }
          }

          function $sync() {
            push();
          }

          //expose to prototype
          AppStorage.prototype.$sync = $sync;

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
