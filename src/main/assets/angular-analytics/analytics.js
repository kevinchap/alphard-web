/**
 * Inspired by https://segment.com/docs/libraries/analytics.js/
 *
 * Configuration:
 *   require.config({
 *     config: {
 *       "angular-analytics/analytics": {
 *         debug: false,
 *         anonymousId: "anonymous"
 *       }
 *     }
 *   })
 *
 */
define(['module', 'angular'], function (module, angular) {
  'use strict';
  //util
  var __throw = function (o) { throw o; };
  var __required = function (o, name) {
    return o[name] || __throw(new Error('object must have [' + name + ']'));
  };

  //RequireJS module config
  var moduleConfig = (module.config && module.config()) || {};
  var TIME_INIT = (new Date()).getTime();
  var ANONYMOUS_ID = moduleConfig.anonymousId || "anonymous";
  var DEBUG = moduleConfig.debug;

  return angular
    .module(module.id, [])
    .provider("$analytics", function $analyticsProvider() {
      var $analyticsServiceNames = {};

      this.register = function (name, opt_serviceName) {
        $analyticsServiceNames[name] = opt_serviceName || name;
        return this;
      };

      this.unregister = function (name) {
        delete $analyticsServiceNames[name];
        return this;
      };

      this.$get = ['$injector', '$log', function ($injector, $log) {
        var __services = {};

        (function __init__() {
          for (var name in $analyticsServiceNames) {
            var serviceConfig = moduleConfig[name];
            if (serviceConfig) {
              _implementation(name);//initialize
            }
          }
        }());

        function alias(newId, originalId) {
          _forward('alias', [newId, originalId]);
        }

        function identify(userId, traits) {
          _forward('identify', [userId, traits || {}]);
        }

        function pageview(url, properties) {
          _forward('pageview', [url, properties || {}]);
        }

        function track(event, properties) {
          _forward('track', [event, properties || {}]);
        }

        //util
        function _config(name) {
          var conf = {
            debug: DEBUG,
            anonymousId: ANONYMOUS_ID,
            timeInit: TIME_INIT
          };
          angular.extend(conf, moduleConfig[name]);
          return conf;
        }

        function _implementation(name) {
          var serviceName = $analyticsServiceNames[name];
          var service = __services[name];
          if (!service) {
            service = $injector.get(serviceName);
            var serviceConfig = _config(name);
            __required(service, 'alias');
            __required(service, 'identify');
            __required(service, 'pageview');
            __required(service, 'track');
            __required(service, 'config').call(service, serviceConfig);
            __services[name] = service;
          }
          return service;
        }

        function _forward(methodName, args) {
          _debug(methodName + '(', args, ')');
          var listeners = Object.keys(__services);
          var listener;
          for (var i = 0, l = listeners.length; i < l; i++) {
            listener = _implementation(listeners[i]);
            listener[methodName].apply(listener, args);
          }
        }

        function _formatMessage(args) {
          return ["[$analytics]"].concat(Array.prototype.slice.call(args));
        }

        function _debug(var_args) {
          if (DEBUG) {
            $log.debug.apply($log, _formatMessage(arguments));
          }
        }

        return {
          anonymousId: ANONYMOUS_ID,
          alias: alias,
          identify: identify,
          pageview: pageview,
          track: track
        };
      }];
    })
    .directive("ngTrack", ['$analytics', function ($analytics) {

      function _isCommand(element) {
        return ['a:','button:submit','input:button','input:submit'].indexOf(
          element.tagName.toLowerCase() + ':' + (element.type || '')) >= 0;
      }

      function _inferEventType(element) {
        return _isCommand(element)? 'click' : 'click';
      }

      function _inferEventName(element) {
        return (
          _isCommand(element) ? element.innerText || element.value :
          element.id || element.name || element.tagName
        );
      }

      function _isProperty(name) {
        return name.substr(0, 9) === 'analytics' &&
          ['on', 'event'].indexOf(name.substr(10)) === -1;
      }

      function compile($element, $attrs) {

        return function link($scope, $element, $attrs) {
          var eventType = $attrs.analyticsOn || _inferEventType($element[0]);

          function eventName() {
            return $attrs.analyticsEvent || _inferEventName($element[0]);
          }

          function eventData() {
            var properties = {};
            angular.forEach($attrs.$attr, function(attr, name) {
              if (_isProperty(attr)) {
                properties[name.slice(9)] = $attrs[name];
              }
            });
            return properties;
          }

          $element.bind(eventType, function() {
            $analytics.track(eventName(), eventData());
          });
        };
      }

      /////////////////// EXPORT ///////////////////
      return {
        restrict: 'A',
        scope: false,
        compile: compile
      };
    }])
    .run(
      ['$rootScope', '$location', '$analytics',
      function ($rootScope, $location, $analytics) {

        function onLogin($event, identifier, userData) {
          $analytics.identify(identifier, userData);
        }

        function onLogout($event, reason) {
          $analytics.identify($analytics.anonymousId, {});//TODO: better behavior?
        }

        function onPageChange() {
          $analytics.pageview($location.path());
        }

        //connect
        $rootScope.$on('$routeChangeStart', onPageChange);
        $rootScope.$on('$stateChangeStart', onPageChange);
        $rootScope.$on('$auth.login', onLogin);
        $rootScope.$on('$auth.logout', onLogout);
      }]
    );
});
