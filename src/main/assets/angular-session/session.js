define([
  'module',
  'angular',
  'angular-appstorage',
  'angular-time'
],
function (
  module,
  angular,
  ngAppStorage,
  ngTime
) {
  'use strict';

  function exports() {
    return angular
      .module(module.id, [ ngAppStorage.name, ngTime.name ])
      .provider({
        $session: $sessionProvider
      });
  }

  function $sessionProvider() {
    /*jslint validthis:true*/

    var $$name = '$session';
    var $$eventCreation = $$name + ".creation";
    var $$eventChange = $$name + '.change';
    var $$eventExpiration = $$name + ".expiration";
    var settings = {
      debug: false,
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

    this.$get = ["$appStorageFactory", "$browser", "$log", "$rootScope", "$time",
    function ($appStorageFactory, $browser, $log, $rootScope, $time) {

      var
      $session    = {},
      intLimit    = Math.pow(2, 32),
      storage     = $appStorageFactory(settings.storageKey, settings.storageType),
      isExpiring  = false;

      $session.EXPIRATION_INVALID = 'ExpirationInvalid';

      $session.EXPIRATION_USER = 'ExpirationUser';

      $session.EXPIRATION_TIMEOUT = 'ExpirationTimeout';

      /**
       * Return the session id
       *
       * @return {string}
       */
      function $id() {
        return storage.id;
      }
      $session.$id = $id;

      /**
       * Create a new session
       *
       * @param {number=} opt_expiration
       * @param {string=} opt_reason
       * @return {string}
       */
      function $new(opt_expiration, opt_reason) {
        _dispatchEvent($$eventExpiration, opt_reason || $session.EXPIRATION_USER);
        _create(opt_expiration);
        return this;
      }
      $session.$new = $new;

      /**
       * Create the current session data
       *
       * @return {object}
       */
      function $data() {
        _refresh();
        return storage.data;
      }
      $session.$data = $data;

      /**
       * Clear the current session data
       *
       * @return {object}
       */
      function $clear() {
        angular.copy({}, storage.data || (storage.data = {}));
        return this;
      }
      $session.$clear = $clear;

      /**
       * Add an creation event handler
       *
       * @param {function} fn
       */
      function $onCreate(fn) {
        return _addEventListener($$eventCreation, fn);
      }
      $session.$onCreate = $onCreate;

      /**
       * Add an expiration event handler
       *
       * @param {function} fn
       */
      function $onChange(fn) {
        return _addEventListener($$eventChange, fn);
      }
      $session.$onChange = $onChange;

      /**
       * Add an expiration event handler
       *
       * @param {function} fn
       */
      function $onExpire(fn) {
        return _addEventListener($$eventExpiration, fn);
      }
      $session.$onExpire = $onExpire;

      //events
      $onCreate(function () {
        _debug("session created (id=" + $id() + ")");
      });
      $onChange(function ($event, dataNew, dataOld) {
        _debug("session changed (id=" + $id() + ")");
      });
      $onExpire(function ($event, reason) {
        _debug("session expiring (reason=" + reason + ")");
      });

      //util
      function _init() {
        if (!$id()) {
          $new();
        }
        $browser.addPollFn(_refresh)();
      }

      function _create(expirationDelay) {
        var
        id  = _generateId(),
        now = _now();

        $clear();
        storage.id = id;
        storage.createdAt = now;
        storage.expiredAt = now + (expirationDelay || settings.expiration);
        watchData();
      }

      var watchData = _watcher(
        function () { return { id: storage.id, data: storage.data}; },
        function (dataNew, dataOld) {
          if (dataOld) {
            if (dataNew.id !== dataOld.id) {
              _dispatchEvent($$eventCreation);
              _dispatchEvent($$eventChange, dataNew.data, {});
            } else {
              _dispatchEvent($$eventChange, dataNew.data, dataOld.data);
            }
          }
        },
        true
      );

      watchData();

      function _refresh() {
        var expiredAt = storage.expiredAt;
        if (!isExpiring && expiredAt && expiredAt < _now()) {
          isExpiring = true;
          _dispatchEvent($$eventExpiration, $session.EXPIRATION_TIMEOUT);
          _create(null);
          isExpiring = false;
        }
        watchData();
      }

      function _generateId() {
        return Math.floor(Math.random() * intLimit).toString(36);
      }

      function _addEventListener(eventName, fn) {
        return $rootScope.$on(eventName, fn);
      }

      function _dispatchEvent(eventName, $1, $2) {
        $rootScope.$broadcast(eventName, $1, $2);
      }

      function _now() {
        return $time.now();
      }

      function _watcher(pullFn, onchangeFn, opt_deep) {
        var last;

        return (opt_deep ?
          function () {
            var dataNew = pullFn(), dataOld = last, changed = false;
            if (!angular.equals(dataNew, dataOld)) {
              last = angular.copy(dataNew);
              changed = true;
              onchangeFn(dataNew, dataOld);
            }
            return changed;
          } :
          function () {
            var dataNew = pullFn(), dataOld = last, changed = false;
            if (dataNew != dataOld) {
              last = dataNew;
              changed = true;
              onchangeFn(dataNew, dataOld);
            }
            return changed;
          }
        );
      }

      function _formatMessage(args) {
        return ["[" + $$name + "]"].concat(Array.prototype.slice.call(args));
      }

      function _debug(var_args) {
        if (settings.debug) {
          $log.debug.apply($log, _formatMessage(arguments));
        }
      }

      _init();
      return $session;
    }];
  }

  return exports();
});
