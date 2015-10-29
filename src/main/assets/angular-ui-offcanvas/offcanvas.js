define(['module', 'angular'], function (module, angular) {
  'use strict';

  /**
   * Offcanvas directive
   *
   * Usage:
   *
   * <offcanvas>
   *   <offcanvas-content>
   *   </offcanvas-content>
   *   <offcanvas-left>
   *     <!--optional-->
   *   </offcanvas-left>
   *   <offcanvas-right>
   *   </offcanvas-right>
   * </offcanvas>
   */

  //RequireJS Config
  var config = (module.config && module.config()) || {};
  var DISABLED = "disabled";
  var PUSHED = "pushed";

  function bem(prefix, sep) {
    return function $bem(opt_suffix) {
      return prefix + (opt_suffix ? sep + String(opt_suffix).toLowerCase() : "");
    };
  }

  function debug(var_args) {
    if (config.debug) {
      var args = ['[' + module.id + ']'];
      for (var i = 0, l = arguments.length; i < l; i++) {
        args.push(arguments[i]);
      }
      console.debug.apply(console, args);
    }
  }

  debug("config", config);
  return angular
    .module(module.id, [])
    .controller('OffCanvasController', ['$log', function ($log) {
      var self = this;
      var NONE = self.NONE = "none";
      var LEFT = self.LEFT = "left";
      var RIGHT = self.RIGHT = "right";

      self.$$class = "offcanvas";
      self.direction = NONE;

      self.isVisible = function (opt_direction) {
        var direction = self.direction;
        return opt_direction ? opt_direction === direction : direction !== NONE;
      };

      self.setVisible = function (direction) {
        if ([NONE, LEFT, RIGHT].indexOf(direction) < 0) {
          $log.warn('unknown direction ' + direction);
          self.direction = NONE;
        } else {
          self.direction = direction || NONE;
        }
      };

    }])

    .directive("offcanvas", function offcanvas() {

      return {
        restrict: "EA",
        controller: "OffCanvasController",
        controllerAs: "offcanvas",
        compile: function () {
          return function link($scope, $element, $attrs, offcanvas) {
            var $m = bem(offcanvas.$$class, "--");
            var isVisible = offcanvas.isVisible;

            $scope.$watch(function () {
              $element
                .addClass($m())
                .toggleClass($m("push-left"), isVisible(offcanvas.LEFT))
                .toggleClass($m("push-right"), isVisible(offcanvas.RIGHT));
            });
          };
        }
      };
    })

    .directive("offcanvasContent", function offcanvasContent() {
      return {
        require: '^offcanvas',
        restrict: 'EA',
        controller: ["$scope", "$element", function ($scope, $element) {
          var $offcanvas = $element.controller("offcanvas");
          var $$class = bem($offcanvas.$$class, "__")("content");
          var isVisible = $offcanvas.isVisible;

          function close() {
            $offcanvas.setVisible($offcanvas.NONE);
          }

          function onDestroy() {
            $element.bind("mousedown", onMouseDown);
          }

          function onMouseDown($event) {
            if (isVisible()) {
              close();
            }
            $scope.$apply();
          }

          $element.bind("mousedown", onMouseDown);
          $scope.$on("$destroy", onDestroy);
          $scope.$watch(function () {
            $element.addClass($$class);
            $element.attr(DISABLED, isVisible());
          });
        }]
      };
    })

    .directive("offcanvasLeft", function offcanvasLeft() {
      var direction = "left";
      return {
        require: '^offcanvas',
        restrict: 'EA',
        controller: ["$scope", "$element", function ($scope, $element) {
          var $offcanvas = $element.controller("offcanvas");
          var $$class = bem($offcanvas.$$class, "__")(direction);
          var isVisible = $offcanvas.isVisible;

          $scope.$watch(function () {
            $element.addClass($$class);
            if (isVisible(direction)) {
              $element.attr(PUSHED, "");
            } else {
              $element.removeAttr(PUSHED);
            }
          });
        }]
      };
    })

    .directive("offcanvasRight", function offcanvasRight() {
      var direction = "right";
      return {
        require: '^offcanvas',
        restrict: 'EA',
        controller: ["$scope", "$element", function ($scope, $element) {
          var $offcanvas = $element.controller("offcanvas");
          var $$class = bem($offcanvas.$$class, "__")(direction);
          var isVisible = $offcanvas.isVisible;

          $scope.$watch(function () {
            $element.addClass($$class);
            if (isVisible(direction)) {
              $element.attr(PUSHED, "");
            } else {
              $element.removeAttr(PUSHED);
            }
          });
        }]
      };
    });
});
