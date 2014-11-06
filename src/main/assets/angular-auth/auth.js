/**
 * Inspired by https://segment.com/docs/libraries/analytics.js/
 *
 * Configuration:
 *   require.config({
 *     config: {
 *       "angular-auth/auth": {
 *         debug: false
 *       }
 *     }
 *   })
 *
 */
define(['module', 'angular', 'angular-session'], function (module, angular, ngSession) {
  'use strict';

  //RequireJS module config
  var moduleConfig = (module.config && module.config()) || {};
  var DEBUG = moduleConfig.debug;
  var STORAGE_KEY = "$auth";

  return angular
    .module(module.id, [ ngSession.name ])
    .provider("$auth", function $authProvider() {
      var $$name = "$auth";
      var $$eventLogin = $$name + ".login";
      var $$eventLogout = $$name + ".logout";

      this.$get = ['$log', '$rootScope', '$session',
      function ($log, $rootScope, $session) {
        var adapters = {};

        function $auth(name, opt_definition) {
          switch (arguments.length) {
            case 0:
            case 1:
              return adapters[name] || _throwError(name + ' is not a valid adapter');
            default:
              adapters[name] = opt_definition;
          }
        }

        /**
         * @return {string}
         */
        function id() {
          return _sessionStorage().id;
        }
        $auth.id = id;

        /**
         * @return {object}
         */
        function user() {
          return _sessionStorage().user;
        }
        $auth.user = user;

        /**
         *
         * @param {string} identifier
         * @param {object} userData
         * @param {string=} opt_expiration
         */
        function login(identifier, userData, opt_expiration) {
          if (isLogged()) {
            _throwError("AlreadyLogged");
          }
          $session.$new(opt_expiration);
          var storage = _sessionStorage();
          storage.id = identifier;
          storage.user = userData;
          storage.isLogged = true;

          //_dispatchEvent($$eventLogin, storage.id, storage.user);
        }
        $auth.login = login;

        /**
         * Logout current logged user
         *
         * @param {string=} opt_reason
         * @return {boolean}
         */
        function logout(opt_reason) {
          var result = isLogged();
          if (result) {
            $session.$new(null, opt_reason);
          }
          return result;
        }
        $auth.logout = logout;

        /**
         * Return true if logged (i.e non anonymous user)
         *
         * @return {boolean}
         */
        function isLogged() {
          return !!_sessionStorage().isLogged;
        }
        $auth.isLogged = isLogged;

        /**
         * Call fn when `login` event is triggered
         *
         * @param {function} fn($event, identifier, userData)
         */
        function $onLogin(fn) {
          return _addEventListener($$eventLogin, fn);
        }
        $auth.$onLogin = $onLogin;

        /**
         * Call fn when `logout` event is triggered
         *
         * @param {function} fn($event, reason)
         */
        function $onLogout(fn) {
          return _addEventListener($$eventLogout, fn);
        }
        $auth.$onLogout = $onLogout;

        //watch data
        $session.$onChange(function ($event, dataNew, dataOld) {
          var authNew = dataNew[STORAGE_KEY] || {};
          var authOld = dataOld[STORAGE_KEY] || {};
          if (authNew.isLogged && !authOld.isLogged) {
            _dispatchEvent($$eventLogin, authNew.id, authNew.user);
          }
        });

        //watch expiration
        $session.$onExpire(function ($event, reason) {
          if (isLogged()) {
            _dispatchEvent($$eventLogout, reason);
          }
        });

        $onLogin(function ($event, id, userData) {
          _debug('"' + id + '" logged in (id=', id, 'userData=', userData, ').');
        });

        $onLogout(function ($event, reason) {
          var _id = id();
          _debug((_id ? '"' + _id + '"' : '<anonymous>') + ' logged out (reason: ' + reason + ').');
        });

        //util
        function _sessionStorage(opt_target) {
          var s = $session.$data();
          return s[STORAGE_KEY] || (s[STORAGE_KEY] = {});
        }

        function _addEventListener(eventName, fn) {
          return $rootScope.$on(eventName, fn);
        }

        function _dispatchEvent(eventName, $1, $2) {
          return $rootScope.$broadcast(eventName, $1, $2);
        }

        function _throwError(message, opt_type) {
          var Constructor = opt_type || Error;
          throw new Constructor(message);
        }

        function _formatMessage(args) {
          return ["[" + $$name + "]"].concat(Array.prototype.slice.call(args));
        }

        function _debug(var_args) {
          if (DEBUG) {
            $log.debug.apply($log, _formatMessage(arguments));
          }
        }

        return $auth;
      }];
    });
});
