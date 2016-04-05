define(["module", "angular"], function (module, angular) {
  "use strict";

  /**
   * Module
   */
  var ngModule = angular
    .module(module.id, [])

    .directive("ngRatio", NgRatioDirective);

  /**
   * Directive
   *
   * @usage
   *
   * <tag ng-ratio="16:9"></tag>
   */
  function NgRatioDirective() {
    var NAME = "ngRatio";
    var SPACER_CLASS = "ng-ratio-spacer";
    var STYLE =
      '*[ng-ratio] {' +
      '  position: relative;' +
      '}' +
      '*[ng-ratio] > *:first-child:not(.ng-ratio-spacer) {' +
      '  position: absolute;' +
      '  top: 0;' +
      '  left: 0;' +
      '  width: 100%;' +
      '  height: 100%;' +
      '}' +
      '*[ng-ratio] > .ng-ratio-spacer {' +
      '  position: relative;' +
      '  display: block;' +
      '  content: "";' +
      '  width: 100%;' +
      '  visibility: hidden' +
      '}';

    //Include
    $(document)
      .find("head")
      .prepend('<style type="text/css">' + STYLE + '</style>');

    function $(e) {
      return angular.element(e);
    }

    function getOrCreateByClassName($element, className) {
      var spacer = $element[0].getElementsByClassName(className)[0];
      if (!spacer) {
        spacer = $('<div class="' + className + '">');
        $element.append(spacer);
      }
      return $(spacer);
    }

    function parseRatio(expr) {
      expr = expr || "";
      var factor = NaN;

      if (expr.indexOf(":") >= 0) {
        var parts = expr.split(":");
        var width = parseInt(parts[0]);
        var height = parseInt(parts[1]);
        factor = height / width;
      } else if (expr.indexOf("%") >= 0) {
        factor = parseInt(expr.replace("%", "")) / 100;
      } else {
        factor = parseInt(expr);
      }
      return factor;
    }

    return {
      restrict: "A",
      link: function ($scope, $element, $attrs) {
        $scope.$on("$destroy", onDestroy);
        $scope.$watch(ratio, render);

        function ratio() {
          return $attrs[NAME];
        }

        function render() {
          var $spacerElement = getOrCreateByClassName($element, SPACER_CLASS);
          var factor = parseRatio(ratio());

          var paddingTopOld = $spacerElement.css("padding-top");
          var paddingTop = (factor * 100) + "%";
          if (paddingTopOld !== paddingTop) {
            $spacerElement.css("padding-top", paddingTop);
          }
        }

        function onDestroy() {
          getOrCreateByClassName($element, SPACER_CLASS).remove();
        }
      }
    };
  }


  return ngModule;
});