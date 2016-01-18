define(["module", "angular"], function (module, angular) {
  "use strict";

  var moduleConfig = (module.config && module.config()) || {};

  function debug(var_args) {
    if (moduleConfig.debug) {
      var args = ['[' + module.id + ']'];
      for (var i = 0, l = arguments.length; i < l; i++) {
        args.push(arguments[i]);
      }
      console.debug.apply(console, args);
    }
  }

  return angular
    .module(module.id, [])

    .provider("$link", function () {

      var _config = {};// {[rel: string]: string }

      this.rel = function (rel, opt_service) {
        if (arguments.length >= 2) {
          if (!opt_service) {
            delete _config[rel];
          } else {
            _config[rel] = opt_service;
          }
          return this;
        } else {
          return _config[rel];
        }
      };

      this.$get = ["$injector", "$log", function ($injector, $log) {
        var handlers = {};

        function getHandler(rel) {
          var handler;
          if (rel) {
            handler = handlers[rel];
            if (!handler) {
              var moduleOrFunction = _config[rel];
              if (moduleOrFunction) {
                handler = angular.isString(moduleOrFunction)?
                  $injector.get(moduleOrFunction) :
                  $injector.invoke(moduleOrFunction);

                handlers[rel] = handler;
              }
            }
          }
          return handler;
        }
        return {
          getHandler: getHandler
        };
      }];
    })

    .directive("link", ["$link", "$exceptionHandler", function ($link, $exceptionHandler) {
      return {
        //priority: 100,
        terminal: true,
        restrict: "E",
        link: function ($scope, $element, $attrs) {

          $scope.$watchGroup([
            function () { return $attrs.rel; },
            function () { return $attrs.href; }
          ], function (d) {
            var rel = d[0];
            if (rel) {
              var handler = $link.getHandler(rel);
              if (handler) {
                debug("handler found for", $element[0]);
                try {
                  handler($scope, $element, $attrs);
                } catch (e) {
                  $exceptionHandler(e);
                }
              }
            }
          });

        }
      };
    }]);
});