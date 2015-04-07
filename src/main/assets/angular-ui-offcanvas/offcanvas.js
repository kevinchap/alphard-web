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
      this.NONE = "none";
      this.LEFT = "left";
      this.RIGHT = "right";

      this.direction = this.NONE;

      this.isVisible = function (opt_direction) {
        return opt_direction ? opt_direction === this.direction : this.direction !== this.NONE;
      };

      this.setVisible = function (direction) {
        if ([this.NONE, this.LEFT, this.RIGHT].indexOf(direction) < 0) {
          $log.warn('unknown direction ' + direction);
          this.direction = this.NONE;
        } else {
          this.direction = direction || this.NONE;
        }
      };

      self.$$class = "offcanvas";
    }])

    .directive("offcanvas", function offcanvas() {

      return {
        restrict: 'EA',
        //replace: true,
        //transclude: true,
        //template: offcanvasHTML,
        controller: "OffCanvasController",
        controllerAs: "offcanvas",
        compile: function () {
          return function link($scope, $element, $attrs, offcanvas) {
            var $m = bem(offcanvas.$$class, "--");

            $scope.$watch(function () {
              $element
                .addClass($m())
                .toggleClass($m("push-left"), isVisible('left'))
                .toggleClass($m("push-right"), isVisible('right'));
            });

            function isVisible(s) {
              return offcanvas.isVisible(s);
            }
          };
        }
      };
    })

    .directive("offcanvasContent", function offcanvasContent() {
      return {
        require: '^offcanvas',
        restrict: 'EA',
        compile: function () {
          return function link($scope, $element, $attrs, offcanvas) {
            var $$class = bem(offcanvas.$$class, "__")("content");

            function isVisible() {
              return offcanvas.isVisible();
            }

            function close() {
              offcanvas.setVisible(offcanvas.NONE);
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
            $scope.$watch(
              function () {
                $element.addClass($$class);
                $element.attr("disabled", isVisible());
              });
          };
        }
      };
    })

    .directive("offcanvasLeft", function offcanvasLeft() {
      var direction = "left";
      return {
        require: '^offcanvas',
        restrict: 'EA',
        compile: function () {
          return function link($scope, $element, $attrs, offcanvas) {
            var $$class = bem(offcanvas.$$class, "__")(direction);

            $scope.$watch(function () {
              $element.addClass($$class);

              if (offcanvas.isVisible(direction)) {
                $element.attr("pushed", "");
              } else {
                $element.removeAttr("pushed");
              }
            });
          };
        }
      };
    })

    .directive("offcanvasRight", function offcanvasRight() {
      var direction = "right";
      return {
        require: '^offcanvas',
        restrict: 'EA',
        compile: function () {
          return function link($scope, $element, $attrs, offcanvas) {
            var $$class = bem(offcanvas.$$class, "__")(direction);

            $scope.$watch(function () {
              $element.addClass($$class);

              if (offcanvas.isVisible(direction)) {
                $element.attr("pushed", "");
              } else {
                $element.removeAttr("pushed");
              }
            });
          };
        }
      };
    });
});
