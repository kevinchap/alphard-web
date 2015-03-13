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

            $element.bind("click", onClick);
            $scope.$on("$destroy", onDestroy);
            $scope.$watch(function () {
              var $$class = offcanvas.$$class;

              $element
                .addClass($$class)
                .toggleClass($$class + "--push-left", offcanvas.isVisible('left'))
                .toggleClass($$class + "--push-right", offcanvas.isVisible('right'));
            });

            function onDestroy() {
              $element.bind("click", onClick);
            }

            function onClick($event) {
              offcanvas.setVisible(offcanvas.NONE);
              $scope.$apply();
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
            var $$class = offcanvas.$$class + '__content';

            $scope.$watch(
              function () {
                $element
                  .addClass($$class)
                  .attr("disabled", offcanvas.isVisible() || null);
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
            var $$class = offcanvas.$$class + '__' + direction;

            $scope.$watch(function () {
              $element
                .addClass($$class)
                .attr("pushed", offcanvas.isVisible(direction) || null);
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
            var $$class = offcanvas.$$class + '__' + direction;

            $scope.$watch(function () {
              $element
                .addClass($$class)
                .attr("pushed", offcanvas.isVisible(direction) || null);
            });
          };
        }
      };
    });
});
