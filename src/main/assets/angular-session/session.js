define([
  'module',
  'angular',
  'angular-webstorage',
  'angular-time'
],
function (module, angular, ngWebStorage, ngTime) {
  'use strict';

  //RequireJS module config
  var moduleConfig = (module.config && module.config()) || {};

  /**
   * SessionGeneratorId class
   */
  var SessionIdGenerator = (function (_super) {
    var INT_LIMIT = Math.pow(2, 32);

    function SessionIdGenerator() {
      _super.call(this);
    }

    SessionIdGenerator.prototype.next = function () {
      return Math.floor(Math.random() * INT_LIMIT).toString(36);
    };

    return SessionIdGenerator;
  }(Object));

  /**
   * SessionManager class
   */
  var SessionManager = (function (_super) {
    var $$name = "$session";
    var __defineGetter = function (o, name, f) {
      if (Object.defineProperty) {
        Object.defineProperty(o, name, {
          get: f
        });
      } else {
        o.__defineGetter__(name, f);
      }
    };
    var __keys = Object.keys;
    //var __eq = angular.equals;
    var __isFunction = function (o) { return typeof o === "function"; };
    var __assertStorage = function (o) {
      if (
        !__isFunction(o.getItem) ||
        !__isFunction(o.setItem) ||
        !__isFunction(o.removeItem) ||
        !__isFunction(o.key) ||
        !__isFunction(o.clear)
      ) {
        throw new TypeError(o + " must be a Storage");
      }
      return o;
    };
    var EXPIRATION_INVALID = 'ExpirationInvalid';
    var EXPIRATION_USER = 'ExpirationUser';
    var EXPIRATION_TIMEOUT = 'ExpirationTimeout';

    var $$eventCreate = "create";
    var $$eventExpire = "expire";
    var $$eventChange = "change";

    function SessionManager(settings) {
      //_super.call(this);
      //var self = this;
      var $log = _setting("$log");
      this.$$expiration = _setting("expiration");
      var _debug =
        _setting("debug", false) ? function (var_args) {
          var offset = 0;
          for (var i = 0, l = arguments.length - offset, rest = new Array(l); i < l; ++i) {
            rest[i] = arguments[i + offset];
          }
          $log.debug.apply($log, _formatMessage(rest));
        } :
        function (var_args) {};
      this.$$storage = __assertStorage(_setting("$storage"));

      this.$$storageKey = _setting("storageKey");
      this.$$storageValue = undefined;
      this.$$sessionIdGenerator = _setting("$sessionIdGenerator");
      this.$$time = _setting("$time");
      this.$$listeners = {};

      __defineGetter(this, "length", this.size);

      //Init
      this.$onCreate(function () {
        _debug("session created (id=" + this.$id() + ")");
      });
      this.$onChange(function ($event, dataNew, dataOld) {
        _debug("session changed (id=" + this.$id() + ")", dataNew, dataOld);
      });
      this.$onExpire(function ($event, reason) {
        _debug("session expiring (reason=" + reason + ")");
      });

      //create if not existing
      if (!this.$id()) {
        this.$new();
      }

      function _formatMessage(args) {
        return ["[" + $$name + "]"].concat(args);
      }

      function _setting(key, opt_value) {
        var returnValue = settings[key];
        if (!settings.hasOwnProperty(key)) {
          if (arguments.length <= 1) {
            throw new Error("setting[" + key + "] is required");
          } else {
            returnValue = opt_value;
          }
        }
        return returnValue;
      }
    }

    SessionManager.prototype.EXPIRATION_INVALID = EXPIRATION_INVALID;
    SessionManager.prototype.EXPIRATION_USER = EXPIRATION_USER;
    SessionManager.prototype.EXPIRATION_TIMEOUT = EXPIRATION_TIMEOUT;

    SessionManager.prototype.length = 0;

    SessionManager.prototype.$$storageKey = "";
    SessionManager.prototype.$$storageValue = "";
    SessionManager.prototype.$$storageData = undefined;

    /**
     * Return the session id
     *
     * @return {string}
     */
    SessionManager.prototype.$id = function () {
      _storageRead(this);
      return _storageData(this).id;
    };

    /**
     * Create a new session
     *
     * @param {object=} opt_data
     * @param {number=} opt_expiration
     * @param {string=} opt_reason
     * @return {SessionManager}
     */
    SessionManager.prototype.$new = function $new(opt_data, opt_expiration, opt_reason) {
      _open(this, opt_data, opt_expiration, opt_reason || EXPIRATION_USER);
      return this;
    };

    /**
     * Clear the current session data
     *
     * @return {SessionManager}
     */
    SessionManager.prototype.clear = function clear() {
      angular.copy({}, _storageData(this).data);
      _storageWrite(this);
      return this;
    };

    /**
     *
     * @return {number}
     */
    SessionManager.prototype.size = function () {
      _storageRead(this);
      return __keys(_storageData(this).data).length;
    };

    /**
     *
     * @param {number} i
     * @return {string}
     */
    SessionManager.prototype.key = function (i) {
      _storageRead(this);
      return __keys(_storageData(this).data)[i];
    };

    /**
     *
     * @param {string} key
     * @return {*}
     */
    SessionManager.prototype.getItem = function (key) {
      _storageRead(this);
      return _storageData(this).data[key];
    };

    /**
     *
     * @param {string} key
     * @param {*} val
     */
    SessionManager.prototype.setItem = function (key, val) {
      _storageRead(this);
      _storageData(this).data[key] = val;
      _storageWrite(this);
    };

    /**
     *
     * @param {string} key
     */
    SessionManager.prototype.removeItem = function (key) {
      _storageRead(this);
      delete _storageData(this).data[key];
      _storageWrite(this);
    };

    /**
     * Add an creation event handler
     *
     * @param {function($ev: Event)} fn
     * @returns {function}
     */
    SessionManager.prototype.$onCreate = function $onCreate(fn) {
      return this.addEventListener($$eventCreate, fn);
    };

    /**
     * Add an expiration event handler
     *
     * @param {function($ev: Event, reason: string, data: *)} fn
     * @returns {function}
     */
    SessionManager.prototype.$onChange = function $onChange(fn) {
      return this.addEventListener($$eventChange, fn);
    };

    /**
     * Add an expiration event handler
     *
     * @param {function($ev: Event, reason: string, data: *)} fn
     * @returns {function}
     */
    SessionManager.prototype.$onExpire = function $onExpire(fn) {
      return this.addEventListener($$eventExpire, fn);
    };

    SessionManager.prototype.addEventListener = function addEventListener(eventName, fn) {
      var $$listeners = this.$$listeners[eventName] || (this.$$listeners[eventName] = []);
      $$listeners.push(fn);
      return this;
    };

    SessionManager.prototype.removeEventListener = function removeEventListener(eventName, fn) {
      var $$listeners = this.$$listeners[eventName];
      if ($$listeners) {
        $$listeners.splice($$listeners.indexOf(fn), 1);
      }
    };

    SessionManager.prototype.dispatchEvent = function dispatchEvent(eventName, var_args) {
      var $$listeners = this.$$listeners[eventName];
      if ($$listeners) {
        var offset = 1;
        var argc = arguments.length;
        var args = new Array(argc - offset);
        for (var argi = offset; argi < argc; argi++) {
          args[argi] = arguments[argi];
        }
        for (var i = 0, l = $$listeners.length; i < l; i++) {
          $$listeners[i].apply(this, args);
        }
      }
    };

    function _storageRead(self) {
      var $storage = self.$$storage;
      var $storageKey = self.$$storageKey;
      var init = self.$$storageData === undefined;
      var $storageValueOld = self.$$storageValue;
      var $storageValueNew = $storage.getItem($storageKey);

      if ($storageValueNew !== $storageValueOld) {
        self.$$storageValue = $storageValueNew;
        var $storageDataOld = self.$$storageData;
        var $storageDataNew = $storageValueNew ? angular.fromJson($storageValueNew) : {};
        self.$$storageData = $storageDataNew;

        if (!init) {
          _storageOnChange(self, $storageDataNew, $storageDataOld);
        }
      }
    }

    function _storageReadExpire(self) {
      //expiration
      var data = _storageRead(self);
      var expiredAt = data.expiredAt;
      if (/*!isExpiring && */expiredAt && expiredAt < _now()) {
        //isExpiring = true;
        _open(self, {}, null, EXPIRATION_TIMEOUT);
        //isExpiring = false;
        data = _storageRead(self);
      }
      return data;
    }

    function _storageWrite(self) {
      var $storage = self.$$storage;
      var $storageKey = self.$$storageKey;
      var $storageValueNew = angular.toJson(self.$$storageData);
      var $storageValueOld = $storage.getItem($storageKey);

      if ($storageValueNew !== $storageValueOld) {
        var $storageDataOld = $storageValueOld ? angular.fromJson($storageValueOld) : {};
        var $storageDataNew = self.$$storageData;

        self.$$storageValue = $storageValueNew;
        $storage.setItem($storageKey, $storageValueNew);
        _storageOnChange(self, $storageDataNew, $storageDataOld);
      }
    }

    function _storageOnChange(self, dataNew, dataOld) {
      var reason = dataNew.expirationReason;
      if (reason) {
        self.dispatchEvent($$eventExpire, reason, dataOld);
      } else if (dataNew.id !== dataOld.id) {
        self.dispatchEvent($$eventCreate, dataNew);
        self.dispatchEvent($$eventChange, dataNew.data, /*dataOld*/ {});
      } else {
        self.dispatchEvent($$eventChange, dataNew.data, dataOld.data);
      }
    }

    function _storageData(self) {
      return self.$$storageData;
    }

    function _open(self, data, expirationDelay, expirationReason) {
      //kick out
      _close(self, expirationReason);

      //create new one
      var now = _now(self);
      var storageData = _storageData(self);
      storageData.id = _generateId(self);
      storageData.data = data ? angular.copy(data) : {};
      storageData.createdAt = now;
      storageData.expiredAt = now + (expirationDelay || self.$$expiration);
      storageData.expirationReason = undefined;
      _storageWrite(self);
    }

    function _close(self, expirationReason) {
      //kick out
      var storageData = _storageData(self);
      storageData.expiredAt = _now(self);
      storageData.expirationReason = expirationReason;
      _storageWrite(self);
    }

    function _generateId(self) {
      return self.$$sessionIdGenerator.next();
    }

    function _now(self) {
      return self.$$time.now();
    }

    return SessionManager;
  }(Object));



  return angular
    .module(module.id, [ ngWebStorage.name, ngTime.name ])

    .provider("$sessionIdGenerator", function () {
      this.$get = [function () { return new SessionIdGenerator(); }];
    })

    .provider("$session", function $sessionProvider() {
      var $$name = '$session';
      var settings = {
        debug: moduleConfig.debug,
        storageType: "local",
        storageKey: 'ng.' + $$name.slice(1),
        expiration: 1 * 24 * 60 * 60 * 1000 //1 day
      };

      /**
       * @param {object=} data
       */
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

      this.$get = ["$webStorage", "$sessionIdGenerator", "$log", "$rootScope", "$time",
      function ($webStorage, $sessionIdGenerator, $log, $rootScope, $time) {
        var $session = new SessionManager({
          $log: $log,
          $storage: $webStorage(settings.storageType),
          $sessionIdGenerator: $sessionIdGenerator,
          $time: $time,
          debug: settings.debug,
          storageKey: settings.storageKey,
          expiration: settings.expiration
        });

        $rootScope.$on("$" + settings.storageType + ".change", function () {
          $session.$id();//trigger synchronization
          $rootScope.$apply();
        });

        function _addEventListener(self, eventName, fn) {
          return self.$$rootScope.$on($$name + "." + eventName, fn);
        }

        function _dispatchEvent(self, eventName, var_args) {
          var $rootScope = self.$$rootScope;
          eventName = $$name + "." + eventName;
          switch (arguments.length) {
            case 1: $rootScope.$broadcast(eventName); break;
            case 2: $rootScope.$broadcast(eventName, arguments[1]); break;
            case 3: $rootScope.$broadcast(eventName, arguments[1], arguments[2]); break;
            case 4: $rootScope.$broadcast(eventName, arguments[1], arguments[2], arguments[3]); break;
          }
        }

        return $session;
      }];
    });

});
