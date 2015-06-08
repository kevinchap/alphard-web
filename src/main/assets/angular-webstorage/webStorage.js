define([
  'module',
  'require',
  'angular',
  'dom/cookieStorage',
  'dom/localStorage',
  'dom/memoryStorage',
  'dom/sessionStorage'
], function (module, require) {
  'use strict';

  //RequireJS module config
  var moduleConfig = (module.config && module.config()) || {};
  var DEBUG = moduleConfig.debug;

  //Imports
  var angular = require("angular");
  var cookieStorage = require("dom/cookieStorage");
  var localStorage = require("dom/localStorage");
  var memoryStorage = require("dom/memoryStorage");
  var sessionStorage = require("dom/sessionStorage");


  return angular
    .module(module.id, [])
    .provider("$webStorage", function $webStorageProvider() {
      this.$get = ['$log', '$rootScope', '$window', function ($log, $rootScope, $window) {
        function $storage(name, storage) {
          var $$name = '$' + name;
          var $$eventName = $$name + ".change";

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
        }

        //Cookie
        var $cookieStorage = $storage('cookieStorage', cookieStorage);

        //Memory
        var $memoryStorage = $storage("memoryStorage", memoryStorage);

        //Session
        var $sessionStorage = $storage('sessionStorage', sessionStorage);

        //Local
        var $localStorage = $storage('localStorage', localStorage);

        //Factory
        function $webStorage(type) {
          var result;
          switch (type) {
            case $webStorage.LOCAL: result = $localStorage; break;
            case $webStorage.MEMORY: result = $memoryStorage; break;
            case $webStorage.SESSION: result = $sessionStorage; break;
            case $webStorage.COOKIE: result = $cookieStorage; break;
            default: throw new Error(type + " is not a valid storage");
          }
          return result;
        }

        //string identifier for storage
        $webStorage.LOCAL = 'local';
        $webStorage.MEMORY = 'memory';
        $webStorage.SESSION = 'session';
        $webStorage.COOKIE = 'cookie';

        return $webStorage;
      }];
    })
    .provider("$cookieStorage", function $cookieStorageProvider() {
      this.$get = ['$webStorage', function ($webStorage) {
        return $webStorage($webStorage.COOKIE);
      }];
    })
    .provider("$memoryStorage", function $memoryStorageProvider() {
      this.$get = ['$webStorage', function ($webStorage) {
        return $webStorage($webStorage.MEMORY);
      }];
    })
    .provider("$localStorage", function $localStorageProvider() {
      this.$get = ['$webStorage', function ($webStorage) {
        return $webStorage($webStorage.LOCAL);
      }];
    })
    .provider("$sessionStorage", function $sessionStorageProvider() {
      this.$get = ['$webStorage', function ($webStorage) {
        return $webStorage($webStorage.SESSION);
      }];
    });
});
