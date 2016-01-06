define(["module", "angular"], function (module, angular) {
  "use strict";

  var moduleConfig = (module.config && module.config()) || {};
moduleConfig.debug = true;
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

      this.set = function (rel, f) {
        _config[rel] = f;
      };

      this.remove = function (rel) {
        delete _config[rel];
      };

      this.$get = ["$injector", "$log", function ($injector, $log) {
        var handlers = {
          "stylesheet": Void,
          "icon": Void,
          "apple-touch-icon": Void,
          "shortcut icon": Void,
          "manifest": Void
        };

        function getHandler(rel) {
          var handler;
          if (rel) {
            handler = handlers[rel];
            if (!handler) {
              var moduleId = _config[rel];
              if (!moduleId) {
                $log.warn('No handler found for <link rel="' + rel + '">');
              } else {
                handler = handlers[rel] = $injector.get(moduleId);
              }
            }
          }
          return handler;
        }

        function Void() {

        }

        return {
          getHandler: getHandler
        };
      }];
    })

    .directive("link", ["$link", function ($link) {
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
            var href = d[1];
            if (rel) {
              var handler = $link.getHandler(rel);
              if (handler) {
                debug("handler found for", $element[0]);
                handler($scope, $element, $attrs);
              }
            }
          });

        }
      };
    }]);
});