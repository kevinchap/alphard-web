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
            function () { return $element.attr("rel"); },
            function () { return $element.attr("href"); }
          ], function (d) {
            var rel = d[0];
            if (rel) {
              var handler = $link.getHandler(rel);
              if (handler) {
                handler($scope, $element, $attrs);
              }
            }
          });

        }
      };
    }]);
});