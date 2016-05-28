define([
  'module',
  'angular',
  'dom/cookieStorage',
  'dom/localStorage',
  'dom/memoryStorage',
  'dom/sessionStorage'
], function (module, angular, cookieStorage, localStorage, memoryStorage, sessionStorage) {
  'use strict';

  //RequireJS module config
  var moduleConfig = (module.config && module.config()) || {};
  var DEBUG = moduleConfig.debug;


  function $webStorageProvider(name, storage) {
    return function () {


      this.$get = ["$log", "$window", "$rootScope", function ($log, $window, $rootScope) {
        var $$name = '$' + name;
        var $$eventName = "$" + name + ".change";

        function _debug(var_args) {
          if (DEBUG) {
            $log.debug.apply(
              $log,
              ["[" + $$name + "]"].concat(Array.prototype.slice.call(arguments))
            );
          }
        }

        if ($window.addEventListener) {
          $window.addEventListener('storage', function (event) {
            //filter if sessionStorage or localStorage
            if (event.storageArea === storage) {
              var eventData = {
                key: event.key,
                newValue: event.newValue,
                oldValue: event.oldValue
              };
              _debug("$rootScope.broadcast(", eventData, ")");
              $rootScope.$broadcast($$eventName, eventData);
            }
          }, false);
        }
        return storage;
      }];
    };
  }

  return angular
    .module(module.id, [])

    .provider("$cookieStorage", $webStorageProvider("cookie", cookieStorage))
    .provider("$memoryStorage", $webStorageProvider("memory", memoryStorage))
    .provider("$localStorage", $webStorageProvider("local", localStorage))
    .provider("$sessionStorage", $webStorageProvider("session", sessionStorage))

  /**
   * Usage:
   *
   *   $webStorage($webStorage.LOCAL) //=> $localStorage
   *   $webStorage($webStorage.COOKIE) //=> $cookieStorage
   */
    .provider("$webStorage", function () {
      var _registry = {};
      var $webStorage = (function () {
        function $webStorage(name) {
          return $webStorage.adapter(name);
        }
        $webStorage.adapter = function () {
          throw new Error("NotImplemented");//To implement in $get
        };
        return $webStorage;
      }());

      this.define = function (name, serviceName) {
        if (this[name]) {
          throw new Error(name + " is already defined");
        }
        var value = name.toLowerCase();
        this[name] = $webStorage[name] = value;
        _registry[value] = serviceName;
      };

      this.$get = ["$injector", function ($injector) {

        $webStorage.adapter = function (name) {
          var serviceName = _registry[name];
          if (!serviceName) {
            throw new Error("$webStorage." + name + " is not defined");
          }
          return $injector.get(serviceName);
        };
        return $webStorage;
      }];
    })

    .config(["$webStorageProvider", function ($webStorageProvider) {
      //Define adapters

      //Local
      $webStorageProvider.define("LOCAL", '$localStorage');
      //Memory
      $webStorageProvider.define("MEMORY", "$memoryStorage");
      //Session
      $webStorageProvider.define("SESSION", "$sessionStorage");
      //Cookie
      $webStorageProvider.define("COOKIE", "$cookieStorage");
    }]);
});
