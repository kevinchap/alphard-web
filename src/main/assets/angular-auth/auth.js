/**
 * Inspired by https://segment.com/docs/libraries/analytics.js/
 *
 * Configuration:
 *   require.config({
 *     config: {
 *       "angular-auth/auth": {
 *         debug: false,
 *         loginURL: "...",
 *         logoutURL: "...",
 *         accessErrorURL: "..."
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
  var LOGIN_URL = moduleConfig.loginURL;
  var LOGOUT_URL = moduleConfig.logoutURL;
  var ACCESS_ERROR_URL = moduleConfig.accessErrorURL;

  /**
   * AuthError class
   */
  var AuthError = (function (_super) {

    function AuthError(message) {
      _super.call(this);

      this.name = this.name;
      this.message = message;
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      } else {
        this.stack = (new Error()).stack; // IMPORTANT!
      }
    }

    AuthError.prototype = Object.create(_super.prototype);

    AuthError.prototype.constructor = AuthError;

    AuthError.prototype.name = "AuthError";

    return AuthError;
  }(Error));
  
  /**
   * AuthRequiredError class
   */
  var AuthRequiredError = (function (_super) {

    function AuthRequiredError(message) {
      _super.call(this, message);
    }

    AuthRequiredError.prototype = Object.create(_super.prototype);

    AuthRequiredError.prototype.constructor = AuthRequiredError;

    AuthRequiredError.prototype.name = "AuthRequiredError";

    return AuthRequiredError;
  }(AuthError));

  return angular
    .module(module.id, [ ngSession.name ])
    .provider("$auth", function $authProvider() {
      var $$name = "$auth";
      var $$eventLogin = $$name + ".login";
      var $$eventLogout = $$name + ".logout";
      var settings = {
        loginURL: LOGIN_URL,
        logoutURL: LOGOUT_URL,
        accessErrorURL: ACCESS_ERROR_URL
      };

      this.config = function (o) {
        if (arguments.length) {
          angular.extend(settings, o);
        } else {
          return angular.copy(o);
        }
      };

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

        //url
        $auth.loginURL = settings.loginURL;
        $auth.logoutURL = settings.logoutURL;
        $auth.accessErrorURL = settings.accessErrorURL;

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

          _dispatchEvent($$eventLogin, storage.id, storage.user);
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

        //

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
    })

  /**
   * Route & State filters
   */
    .run(['$auth', '$injector', '$location', '$rootScope', '$timeout',
      function ($auth, $injector, $location, $rootScope, $timeout) {

        function $injectGet(name) {
          try {
            return $injector.get(name);
          } catch (e) { }
          return null;
        }

        function $routeInterceptor($route) {
          throw new Error('NotImplemented');
        }

        function $stateInterceptor($state) {

          //Getter for auth data configured in each route
          function $stateAuthData(state, key) {
            if (state.length !== 0) {
              var stateData = $state.get(state);
              var authData = stateData && stateData.$auth;
              return (
                authData && (key in authData) ? authData[key] :
                  $stateAuthData(state.split(".").slice(0, -1).join("."), key)
              );
            }
            return null;
          }

          /*
          function $stateAuthByRole(role) {
            var states = $state.get();
            var cache = $stateAuthByRole.cache || ($stateAuthByRole.cache = {});
            var returnValue = cache[role];
            if (!returnValue) {
              for (var stateName in states) {
                var stateData = states[stateName];
                var authData = stateData.$auth;
                if (
                  !stateData.abstract &&
                  authData &&
                  authData[role]
                ) {
                  returnValue = cache[role] = stateName;
                }
              }
            }
            return returnValue;
          }*/

          function $stateIgnored(state) {
            return false;
          }

          //Filter authentified route
          $rootScope.$on('$stateChangeStart',
            function ($event, toState, toParams, fromState, fromParams) {

            if (
              !$stateIgnored(toState.name) && // location ignored
              $stateAuthData(toState.name, "required") // auth required for state
            ) {
              if (!$auth.isLogged()) {
                var referrerURL = $location.url();
                $event.preventDefault();
                $rootScope.$broadcast('$stateChangeError',
                  toState,
                  toParams,
                  fromState,
                  fromParams,
                  new AuthRequiredError(
                    'Authentication is required',
                    referrerURL
                  )
                );
              }
            }
          });

          //Default state change error handler
          $rootScope.$on('$stateChangeError',
            function ($event, toState, toParams, fromState, fromParams, error) {
            var accessErrorURL = $auth.accessErrorURL;
            var referrerURL = $location.url();
            if (accessErrorURL && error.name === 'AuthRequiredError') {
              //mark as caught
              $event.preventDefault();

              //redirect
              $timeout(function () {
                $location
                  .path(accessErrorURL)
                  .search({
                    reason: error.name,
                    referrer: referrerURL
                  });
              }, 0);
            }
          });

          //Default logout behavior
          $auth.$onLogout(function ($event, reason) {
            var logoutURL = $auth.logoutURL;
            var referrerURL = $location.url();
            if (logoutURL) {
              $timeout(function () {
                if (!$event.defaultPrevented) {
                  $location
                    .path(logoutURL)
                    .search({
                      reason: reason,
                      referrer: referrerURL
                    });
                }
              }, 0);
            }
          });

        }

        // $state extension
        var $state = $injectGet('$state');
        if ($state) {
          $stateInterceptor($state);
        }

        var $route = $injectGet('$route');
        if ($route) {
          $routeInterceptor($route);
        }
      }])

  /**
   * Logout hook
   */

    .run(['$auth', '$location', '$timeout', function ($auth, $location, $timeout) {

    }]);
});
