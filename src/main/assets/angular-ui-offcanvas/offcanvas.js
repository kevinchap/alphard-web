define(
[
  'angular',
  'text!angular-ui-offcanvas/offcanvas.html',
  'text!angular-ui-offcanvas/offcanvas-content.html',
  'text!angular-ui-offcanvas/offcanvas-panel.html'
],
function (
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
  function exports(angular) {
    return angular
      .module("ui.offcanvas", [])
      .controller('OffCanvasController', OffCanvasController)
      .directive({
        "offcanvas": offcanvas,
        "offcanvasContent": offcanvasContent,
        "offcanvasLeft": offcanvasPanelFactory('left'),
        "offcanvasRight": offcanvasPanelFactory('right')
      });
  }


  OffCanvasController.$inject = ['$log'];
  function OffCanvasController($log) {
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

  }

  offcanvas.$inject = [];
  function offcanvas() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      template: offcanvasHTML,
      controller: "OffCanvasController",
      controllerAs: "offcanvas"
    };
  }

  offcanvasContent.$inject = [];
  function offcanvasContent() {
    return {
      require: '^offcanvas',
      restrict: 'E',
      replace: true,
      transclude: true,
      template: offcanvasContentHTML
    };
  }

  function offcanvasPanelFactory(direction) {
    return function offcanvasPanel() {
      return {
        compile: function ($element, attrs) {
          return function link($scope, $element, attrs, offcanvas) {
            $scope.direction = direction;
          };
        },
        require: '^offcanvas',
        restrict: 'E',
        replace: true,
        transclude: true,
        template: offcanvasPanelHTML,
        scope: true
      };
    };
  }


  //exports
  if (typeof angular !== "undefined") return exports(angular);
  else throw new Error('angular is not loaded');

});
