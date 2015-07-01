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

  //RequireJS module config
  var moduleConfig = (module.config && module.config()) || {};

  /**
   * Analytics class
   */
  var Analytics = (function (_super) {

    function Analytics(opt_conf) {
      _super.call(this);
      this.__listeners__ = [];
      if (opt_conf) {
        for (var name in opt_conf) {
          if (name in this) {
            this[name] = opt_conf[name];
          }
        }
      }

      this.anonymousId = this.anonymousId;
      this.timeStart = this.timeStart || __now(self);
    }

    Analytics.prototype = Object.create(_super.prototype);

    Analytics.prototype.constructor = Analytics;

    Analytics.prototype.name = "$analytics";

    Analytics.prototype.debug = false;

    Analytics.prototype.anonymousId = "anonymous";

    Analytics.prototype.timeStart = null;

    Analytics.prototype.$log = null;

    Analytics.prototype.$time = null;

    Analytics.prototype.addListener = function addListener(listener) {
      var listeners = this.__listeners__;
      if (listeners.indexOf(listener) < 0) {
        __required(listener, 'alias');
        __required(listener, 'identify');
        __required(listener, 'pageview');
        __required(listener, 'track');
        listeners.push(listener);
        __debug(this, ['addListener(', listener, ')']);
      }
      return this;
    };

    Analytics.prototype.removeListener = function removeListener(listener) {
      var listeners = this.__listeners__;
      var index = listeners.indexOf(listener);
      if (index >= 0) {
        listeners.splice(index, 1);
        __debug(this, ['removeListener(', listener, ')']);
      }
      return this;
    };

    Analytics.prototype.alias = function alias(newId, originalId) {
      this._forward('alias', [newId, originalId]);
      return this;
    };

    Analytics.prototype.identify = function identify(userId, traits) {
      this._forward('identify', [userId, traits || {}]);
      return this;
    };

    Analytics.prototype.pageview = function pageview(url, properties) {
      this._forward('pageview', [url, properties || {}]);
      return this;
    };

    Analytics.prototype.track = function track(event, properties) {
      this._forward('track', [event, properties || {}]);
      return this;
    };

    Analytics.prototype._forward = function _forward(methodName, args) {
      __debug(this, [methodName + '(', args, ')']);
      var listeners = this.__listeners__;
      var listener;
      for (var i = 0, l = listeners.length; i < l; i++) {
        listener = listeners[i];
        listener[methodName].apply(listener, args);
      }
    };

    function __throw(o) {
      throw o;
    }

    function __required(o, name) {
      return (name in o) ? o[name] : __throw(new Error('object must have [' + name + ']'));
    }

    function __now(self) {
      return self.$time ? self.$time.now() : (new Date()).getTime();
    }

    function __debug(self, args) {
      var $log = self.$log;
      if ($log && self.debug) {
        $log.debug.apply($log, __formatMessage(self, args));
      }
    }

    function __formatMessage(self, args) {
      return ["[" + self.name + "]"].concat(Array.prototype.slice.call(args));
    }

    return Analytics;
  }(Object));



  return angular
    .module(module.id, [])
    .provider("$analytics", function $analyticsProvider() {
      var $analyticsFactoryNames = {};

      this.register = function (name, opt_serviceName) {
        $analyticsFactoryNames[name] = opt_serviceName || name;
        return this;
      };

      this.unregister = function (name) {
        delete $analyticsFactoryNames[name];
        return this;
      };

      this.$get = ['$injector', '$log', function ($injector, $log) {

        //build module
        var $analytics = new Analytics(angular.copy(moduleConfig));

        //inject optional service
        $analytics.$log = $log;
        //$analytics.$time = $time;

        //get implementations
        for (var name in moduleConfig) {
          var factoryName = $analyticsFactoryNames[name];
          if (factoryName) {
            var serviceConfig = _config(name);
            var ServiceConstructor = $injector.get(factoryName);
            var service = new ServiceConstructor(serviceConfig);
            $analytics.addListener(service);
          }
        }

        //util
        function _config(name) {
          var conf = angular.copy(moduleConfig);
          angular.extend(conf, moduleConfig[name]);
          return conf;
        }

        //exports
        return $analytics;
      }];
    })

  /**
   *
   *
   * Usage:
   *
   * <anytag
   *   ng-analytics="toto.titi.tata"
   *   [ng-analytics-on="click focus"]
   *   [ng-analytics-data="{}"]>
   *
   * </anytag>
   */
    .directive("ngAnalytics", ['$analytics', function ($analytics) {
      var $$name = "ngAnalytics";
      var COMMAND = ['a:','button:submit','input:button','input:submit'];

      function _isCommand(element) {
        return COMMAND.indexOf(
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

      /*function _isProperty(name) {
        return name.substr(0, $$name.length) === $$name &&
          ['on', 'event'].indexOf(name.substr($$name.length + 1)) === -1;
      }*/

      /////////////////// EXPORT ///////////////////
      return {
        restrict: 'A',
        scope: false,
        compile: function compile($element, $attrs) {

          return function link($scope, $element, $attrs) {
            var eventType = attr('on') || _inferEventType($element[0]);

            function attr(name) {
              return $attrs[$$name + name.charAt(0).toUpperCase() + name.slice(1)];
            }

            function trackName() {
              return attr('event') || _inferEventName($element[0]);
            }

            function trackData(eventTypeDefault) {
              var data = {};
              /*angular.forEach($attrs.$attr, function(attr, name) {
                if (_isProperty(attr)) {
                  data[name.slice(9)] = $attrs[name];
                }
              });*/

              //set default eventType
              data.eventType = eventTypeDefault;

              //get data from ng-analytics-data
              var attrData = attr('data');
              if (attrData) {
                angular.extend(data, $scope.$eval(attrData));
              }

              return data;
            }

            (function init() {
              $element.bind(eventType, onEvent);
              $scope.$on("$destroy", onDestroy);
            }());

            function onEvent($event) {
              $analytics.track(
                trackName(),
                trackData($event.type)
              );
            }

            function onDestroy($event) {
              $element.unbind(eventType, onEvent);
            }
          };
        }
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
          $analytics.pageview($location.path(), {
            page: $location.url()
          });
        }

        //connect
        $rootScope.$on('$routeChangeSuccess', onPageChange);
        $rootScope.$on('$stateChangeSuccess', onPageChange);
        $rootScope.$on('$auth.login', onLogin);
        $rootScope.$on('$auth.logout', onLogout);
      }]
    );
});
