define(['module', 'angular'], function (module, angular) {
  'use strict';

  function exports() {
    return angular
      .module(module.id, [])
      .provider({
        $webStorage: $webStorageProvider,
        $memoryStorage: $memoryStorageProvider,
        $localStorage: $localStorageProvider,
        $sessionStorage: $sessionProvider
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

  function $memoryStorageProvider() {
    /*jslint validthis:true */
    this.$get = [function () {
      return new MemoryStorage();
    }];
  }

  function $sessionStorageProvider() {
    /*jslint validthis:true */
    this.$get = [function () {
      return $window.sessionStorage || new MemoryStorage();
    }];
  }

  function $localStorageProvider() {
    /*jslint validthis:true */
    this.$get = ['$rootScope', '$window', function ($rootScope, $window) {
      var isSupported = !!$window.localStorage;
      var localStorage = $window.localStorage || new MemoryStorage();
      if (isSupported && $window.addEventListener) {
        $window.addEventListener('storage', function (event) {
          //var key = event.key;
          //var val = event.newValue;
          if (event.storageArea === localStorage) {
            $rootScope.$broadcast("$localStorage.change", [ event ]);
          }
        }, false);
      }

      return localStorage;
    }];
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
