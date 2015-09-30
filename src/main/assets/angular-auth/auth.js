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
define(['module', 'angular', 'angular-session'], function (module) {
  'use strict';

  //Import
  var angular = require("angular");
  var ngSession = require("angular-session");

  //RequireJS module config
  var moduleConfig = (module.config && module.config()) || {};
  var DEBUG = moduleConfig.debug;
  var STORAGE_KEY = "$auth";
  var LOGIN_URL = moduleConfig.loginURL;
  var LOGOUT_URL = moduleConfig.logoutURL;
  var ACCESS_ERROR_URL = moduleConfig.accessErrorURL;

  //State events
  var EVENT_STATE_CHANGE_START = "$stateChangeStart";
  var EVENT_STATE_CHANGE_ERROR = "$stateChangeError";
  //var EVENT_STATE_CHANGE_SUCCESS = "$stateChangeSuccess";

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
        this.stack = (new Error()).stack;// IMPORTANT!
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

    /**
     *
     * @param {string} message
     * @param {string=} opt_referrerUrl
     * @constructor
     */
    function AuthRequiredError(message, opt_referrerUrl) {
      _super.call(
        this,
        message + (opt_referrerUrl ? '(' + opt_referrerUrl + ')' : '')
      );
      this.referrerUrl = opt_referrerUrl || "";
    }

    AuthRequiredError.prototype = Object.create(_super.prototype);

    AuthRequiredError.prototype.constructor = AuthRequiredError;

    AuthRequiredError.prototype.name = "AuthRequiredError";

    AuthRequiredError.prototype.referrerUrl = "";

    return AuthRequiredError;
  }(AuthError));

  return angular
    .module(module.id, [ ngSession.name ])

    /**
     *
     * Usage:
     *
     *   var value = null;
     *   $userCache.put("foo", "bar");
     *   value = $userCache.get("foo");//"bar"
     *
     *   $auth.logout();
     *   value = $userCache.get("foo");//undefined
     */
    .provider("$userCache", function () {
      this.$get = ["$auth", "$cacheFactory", function ($auth, $cacheFactory) {
        var $userCache = $cacheFactory("$userCache");
        var _removeAll = function () { $userCache.removeAll(); };
        var _offLogin = $auth.$onLogin(_removeAll);
        var _offLogout = $auth.$onLogout(_removeAll);

        $userCache.destroy = (function (_super) {
          function destroy() {
            _offLogin();
            _offLogout();
            //free reference
            _offLogin = null;
            _offLogout = null;
            _super.call($userCache);
          }
          return destroy;
        }($userCache.destroy));


        return $userCache;
      }];
    })

    /**
     * Usage:
     *
     *
     */
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

        //Constant
        $auth.EVENT_LOGIN = $$eventLogin;
        $auth.EVENT_LOGOUT = $$eventLogout;

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
          var sessionData = {};
          sessionData[STORAGE_KEY] = {
            id: identifier,
            user: userData,
            isLogged: true
          };
          $session.$new(sessionData, opt_expiration);
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
            $session.$new(null, null, opt_reason);
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
         * @param {function($event: Event, identifier: string, userData: object):*} fn
         * @returns {function}
         */
        function $onLogin(fn) {
          return _addEventListener($$eventLogin, fn);
        }
        $auth.$onLogin = $onLogin;

        /**
         * Call fn when `logout` event is triggered
         *
         * @param {function($event: Event, identifier: string):*} fn
         * @returns {function}
         */
        function $onLogout(fn) {
          return _addEventListener($$eventLogout, fn);
        }
        $auth.$onLogout = $onLogout;

        //watch creation
        $session.$onCreate(function ($event, sessionData) {
          var $authData = sessionData.data[STORAGE_KEY];
          if ($authData && $authData.isLogged) {
            _dispatchEvent($$eventLogin, $authData.id, $authData.user);
          }
        });

/*
        $session.$onChange(function ($event, dataNew, dataOld) {
          var authNew = dataNew[STORAGE_KEY] || {};
          var authOld = dataOld[STORAGE_KEY] || {};
          if (authNew.isLogged && !authOld.isLogged) {
            _dispatchEvent($$eventLogin, authNew.id, authNew.user);
          }
        });*/

        //watch expiration
        $session.$onExpire(function ($event, reason, sessionData) {
          var $authData = sessionData.data[STORAGE_KEY];
          if ($authData && $authData.isLogged) {
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
        function _sessionStorage() {
          var returnValue = $session.getItem(STORAGE_KEY);
          if (!returnValue) {
            $session.setItem(STORAGE_KEY, returnValue = {});
          }
          return returnValue;
        }

        function _addEventListener(eventName, fn) {
          return $rootScope.$on(eventName, fn);
        }

        function _dispatchEvent(eventName) {
          switch (arguments.length) {
            case 1: $rootScope.$broadcast(eventName); break;
            case 2: $rootScope.$broadcast(eventName, arguments[1]); break;
            case 3: $rootScope.$broadcast(eventName, arguments[1], arguments[2]); break;
            case 4: $rootScope.$broadcast(eventName, arguments[1], arguments[2], arguments[3]); break;
          }
        }

        function _throwError(message, opt_type) {
          var Constructor = opt_type || Error;
          throw new Constructor(message);
        }

        function _formatMessage(args) {
          return ["[" + $$name + "]"].concat(args);
        }

        function _debug(var_args) {
          if (DEBUG) {
            var offset = 0;
            for (var i = 0, l = arguments.length - offset, rest = new Array(l); i < l; ++i) {
              rest[i] = arguments[i + offset];
            }
            $log.debug.apply($log, _formatMessage(rest));
          }
        }

        return $auth;
      }];
    })

    /**
     * Route & State filters
     */
    .run(['$auth', '$cacheFactory', '$injector', '$location', '$log', '$rootScope', '$timeout',
      function ($auth, $cacheFactory, $injector, $location, $log, $rootScope, $timeout) {

        function _debugAccess(url, status) {
          _debug('ACCESS ' + url + ' (' + status + ')');
        }

        function $routeInterceptor($route) {
          throw new Error('NotImplemented');
        }

        function $stateInterceptor($state) {
          var $stateDataCache = $cacheFactory("$stateAuth");
          var stateDataDefault = { required: false };

          //Getter for auth data configured in each route
          function $stateAuthData(state) {
            var stateAuthData = state ? $stateDataCache.get(state.name) : null;
            if (stateAuthData === undefined) {
              var stateParentData = $stateAuthData($stateParent(state));
              stateAuthData = angular.extend({}, stateDataDefault, stateParentData, state.$auth);
              $stateDataCache.put(state.name, stateAuthData);
            }
            return stateAuthData;
          }

          function $stateParent(state) {
            var parentName = state ? state.name.split(".").slice(0, -1).join(".") : "";
            return parentName.length ? $state.get(parentName) : null;
          }

          function $stateIgnored(state) {
            return false;
          }

          function $stateAuthRequired(state) {
            return (
              !$stateIgnored(state) && // location ignored
              $stateAuthData(state).required
            );
          }

          //Filter authentified route
          $rootScope.$on(EVENT_STATE_CHANGE_START,
            function ($event, toState, toParams, fromState, fromParams) {
              var referrerURL = $location.url();

              if ($stateAuthRequired(toState)) {
                if (!$auth.isLogged()) {
                  _debugAccess(referrerURL, 'Refused');
                  $event.preventDefault();//abort change start
                  $rootScope.$broadcast(EVENT_STATE_CHANGE_ERROR,
                    toState,
                    toParams,
                    fromState,
                    fromParams,
                    new AuthRequiredError(
                      'Authentication is required',
                      referrerURL
                    )
                  );
                } else {
                  _debugAccess(referrerURL, 'OK');
                }
              } else {
                _debugAccess(referrerURL, 'OK - Passed');
              }
            });

          //Default state change error handler
          $rootScope.$on(EVENT_STATE_CHANGE_ERROR,
            function ($event, toState, toParams, fromState, fromParams, error) {
            var accessErrorURL = $auth.accessErrorURL;
            var referrerURL = $location.url();
            if (accessErrorURL && (error.name === AuthRequiredError.prototype.name)) {
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
              if ($stateAuthRequired($state.$current)) {
                $timeout(function () {
                  if (!$event.defaultPrevented) {
                    $location
                      .path($auth.accessErrorURL)
                      .search({
                        reason: AuthRequiredError.prototype.name,
                        referrer: referrerURL
                      });
                  }
                }, 0);
              }
            }
          });

        }

        // $state extension
        if ($injector.has('$state')) {
          $stateInterceptor($injector.get('$state'));
        }

        if ($injector.has('$route')) {
          $routeInterceptor($injector.get('$route'));
        }

        //util
        function _formatMessage(args) {
          return ["[$auth]"].concat(args);
        }

        function _debug(var_args) {
          if (DEBUG) {
            var offset = 0;
            for (var i = 0, l = arguments.length - offset, rest = new Array(l); i < l; ++i) {
              rest[i] = arguments[i + offset];
            }
            $log.debug.apply($log, _formatMessage(rest));
          }
        }
      }]);
});
