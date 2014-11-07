define(
[
  'module',
  'angular',
  'text!./offcanvas.html',
  'text!./offcanvas-content.html',
  'text!./offcanvas-panel.html'
],
function (
  module,
  angular,
  offcanvasHTML,
  offcanvasContentHTML,
  offcanvasPanelHTML
) {
  'use strict';

  /**
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

    }])
    .directive("offcanvas", function offcanvas() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        template: offcanvasHTML,
        controller: "OffCanvasController",
        controllerAs: "offcanvas"
      };
    })
    .directive("offcanvasContent", function offcanvasContent() {
      return {
        require: '^offcanvas',
        restrict: 'E',
        replace: true,
        transclude: true,
        template: offcanvasContentHTML
      };
    })
    .directive("offcanvasLeft", function offcanvasLeft() {
      return {
        compile: function ($element, attrs) {
          return function link($scope, $element, attrs, offcanvas) {
            $scope.direction = "left";
          };
        },
        require: '^offcanvas',
        restrict: 'E',
        replace: true,
        transclude: true,
        template: offcanvasPanelHTML,
        scope: true
      };
    })
    .directive("offcanvasRight", function offcanvasRight() {
      return {
        compile: function ($element, attrs) {
          return function link($scope, $element, attrs, offcanvas) {
            $scope.direction = "right";
          };
        },
        require: '^offcanvas',
        restrict: 'E',
        replace: true,
        transclude: true,
        template: offcanvasPanelHTML,
        scope: true
      };
    });
});
