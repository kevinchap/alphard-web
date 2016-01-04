define(["module", "angular"], function (module, angular) {
  "use strict";


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

        function ngLink($scope, $element, $attrs) {
          var rel = $element.attr("rel");
          var handler = getHandler(rel);

          if (handler) {
            handler($scope, $element, $attrs);
          }
        }

        function Void() {

        }

        return ngLink;
      }];
    })

    .directive("link", ["$link", function ($link) {
      return {
        terminal: true,
        restrict: "E",
        link: function ($scope, $element, $attrs) {
          $link($scope, $element, $attrs);
        }
      };
    }]);
});