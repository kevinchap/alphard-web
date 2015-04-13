define(['module', 'angular'], function (module, angular) {
  'use strict';

  //RequireJS module config
  var moduleConfig = (module.config && module.config()) || {};
  var DEBUG = moduleConfig.debug;

  /**
   * MemoryStorage class
   *
   * Description:
   *  Follows exact same API than localStorage and sessionStorage
   */
  var MemoryStorage = (function () {
    var __keys = Object.keys;

    function MemoryStorage() {
      if (this instanceof MemoryStorage) {
        Object.defineProperty(this, "length", {
          get: function () { return __keys(this).length; },
          set: function (val) { }
        });
      } else {
        return new MemoryStorage();
      }
    }

    MemoryStorage.prototype.clear = function clear() {
      var keys = __keys(this);
      for (var i = 0, l = keys.length; i < l; ++i) {
        delete this[keys[i]];
      }
    };

    MemoryStorage.prototype.key = function key(index) {
      return __keys(this)[index];
    };

    MemoryStorage.prototype.getItem = function getItem(key) {
      return this[key];
    };

    MemoryStorage.prototype.setItem = function setItem(key, val) {
      this[key] = String(val);
    };

    MemoryStorage.prototype.removeItem = function removeItem(key) {
      delete this[key];
    };

    return MemoryStorage;
  }());


  return angular
    .module(module.id, [])
    .provider("$webStorage", function $webStorageProvider() {
      this.$get = ['$log', '$rootScope', '$window', function ($log, $rootScope, $window) {
        function windowStorage(name) {
          var storageSupported = (function () {
            var testKey = 'localStorageTest' + Math.random();
            var storage = $window[name];
            var returnValue = false;
            try {
              //Safari in private mode can throw error
              storage.setItem(testKey, 1);
              storage.removeItem(testKey);
              returnValue = true;
            } catch (e) {}
            return returnValue;
          }());
          var storage = storageSupported ? $window[name] : new MemoryStorage();
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

          if (storageSupported && $window.addEventListener) {
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

        //Memory
        var memoryStorage = new MemoryStorage();

        //Session
        var sessionStorage = windowStorage('sessionStorage');

        //Local
        var localStorage = windowStorage('localStorage');

        //Factory
        function $webStorage(type) {
          var result;
          switch (type) {
            case $webStorage.LOCAL: result = localStorage; break;
            case $webStorage.MEMORY: result = memoryStorage; break;
            case $webStorage.SESSION: result = sessionStorage; break;
            default: throw new Error(type + " is not a valid storage");
          }
          return result;
        }

        //string identifier for storage
        $webStorage.LOCAL = 'local';
        $webStorage.MEMORY = 'memory';
        $webStorage.SESSION = 'session';

        return $webStorage;
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
