define(['angular'], function (angular) {
  'use strict';

  function exports() {
    return angular
      .module("ngWebStorage", [])
      .provider({
        $webStorage: $webStorageProvider,
        $memoryStorage: $storageProvider("memoryStorage"),
        $localStorage: $storageProvider("localStorage"),
        $sessionStorage: $storageProvider("sessionStorage")
      });
  }

  var MemoryStorage = (function () {
    function MemoryStorage() {
      if (this instanceof MemoryStorage) {
        Object.defineProperty(this, "length", {
          get: function () { return Object.keys(this).length; },
          set: function (val) { }
        });
      } else {
        return new MemoryStorage();
      }
    }

    MemoryStorage.prototype.clear = function clear() {
      var keys = Object.keys(this);
      for (var i = 0, l = keys.length; i < l; ++i) {
        delete this[keys[i]];
      }
    };

    MemoryStorage.prototype.key = function key(index) {
      return Object.keys(this)[index];
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

  function $storageProvider(storageType) {
    return function provider() {
      var settings = {
        debug: false
      };

      this.config = function (data) {
        if (arguments.length) {
          angular.extend(settings, data);
          return this;
        } else {
          return angular.copy(settings);
        }
      };

      this.$get = [
        '$log', '$rootScope', '$window',
        function ($log, $rootScope, $window) {
          var moduleName = "$" + storageType;
          var isSupported = !!$window[storageType] || 'memoryStorage' === storageType;
          var webStorage = $window[storageType] || new MemoryStorage();

          function __init__() {
            if (isSupported && $window.addEventListener) {
              $window.addEventListener('storage', __onchange__, false);
            }
          }

          function __onchange__(event) {
            //var key = event.key;
            //var val = event.newValue;
            if (event.storageArea === webStorage) {
              //_debug("browser event received", event);
              _debug(moduleName + ".change broadcast", $storage);
              $rootScope.$broadcast(moduleName + ".change");
            }
          }

          //util
          function _formatMessage(args) {
            var a = ["[" + moduleName + "]"];
            for (var i = 0, l = args.length; i < l; ++i) {
              a.push(args[i]);
            }
            return a;
          }

          function _debug(var_args) {
            if (settings.debug) {
              $log.debug.apply($log, _formatMessage(arguments));
            }
          }

          function _warn(var_args) {
            $log.warn.apply($log, _formatMessage(arguments));
          }

          __init__();
          return webStorage;
        }];
    };
  }

  function $webStorageProvider() {

    this.$get = [
      '$localStorage', '$memoryStorage', '$sessionStorage',
      function ($localStorage, $memoryStorage, $sessionStorage) {

        function $webStorage(type) {
          var result;
          switch (type) {
            case 'local': result = $localStorage; break;
            case 'memory': result = $memoryStorage; break;
            case 'session': result = $sessionStorage; break;
            default: throw new Error(type + " is not a valid storage");
          }
          return result;
        }

        return $webStorage;
      }];
  }

  return exports();
});
