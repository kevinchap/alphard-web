define(["module", "angular"], function (module, angular) {
  "use strict";

  /**
   * Angular module
   */
  var ngModule = angular
    .module(module.id, [])

    .directive("mdCollapse", MdCollapse);

  /**
   * @usage
   * <tag md-collapse=" |horizontal|vertical"
   *      ng-show="..."
   *      ng-hide="...">
   * </tag>
   */
  MdCollapse.$inject = ["$log"];
  function MdCollapse($log) {
    var $$name = "mdCollapse";
    var NGSHOW = "ngShow";
    var NGHIDE = "ngHide";
    var HORIZONTAL = "horizontal";
    var VERTICAL = "vertical";
    var STYLE = (function () {
      function collapse(property, delay) {
        var transition = property + ' ' + delay;
        return (
          '  overflow' + (property === "width" ? '-x' : '-y') + ': hidden;\n' +
          '  -webkit-transition: ' + transition + ';\n' +
          '  -moz-transition: ' + transition + ';\n' +
          '  -ms-transition: ' + transition + ';\n' +
          '  -o-transition: ' + transition + ';\n' +
          '  transition: ' + transition + ';\n'
        );
      }

      return (
        '[md-collapse="vertical"],\n' +
        '[md-collapse]:not([md-collapse="horizontal"]) {\n' +
        collapse("height", "300ms") +
        '}\n' +
        '[md-collapse="horizontal"] {\n' +
        collapse("width", "300ms") +
        '}\n'
      );
    }());

    //Include
    angular
      .element(document)
      .find("head")
      .prepend('<style type="text/css">' + STYLE + '</style>');

    return {
      restrict: "A",
      compile: function () {
        return function link($scope, $element, $attrs) {
          $scope.$watchGroup([
            direction,
            isVisible
          ], function (newValues) {
            update(newValues[0], newValues[1]);
          });

          function direction() {
            return $attrs[$$name] || VERTICAL;
          }

          function isVisible() {
            if (NGSHOW in $attrs) {
              return !!$scope.$eval($attrs[NGSHOW]);
            } else if (NGHIDE in $attrs) {
              return !$scope.$eval($attrs[NGHIDE]);
            } else {
              return true;
            }
          }

          function update(direction, isVisible) {
            var dir = (direction || "").toLowerCase();
            var property = "width";
            var scrollProperty = "scrollWidth";
            switch (dir) {
              case HORIZONTAL:
                //keep default
                break;
              case VERTICAL:
                property = "height";
                scrollProperty = "scrollHeight";
                break;
              default:
                $log.warn('[md-collapse]', direction + " must be " + HORIZONTAL + "|" + VERTICAL);
            }

            $element
              .addClass("ng-hide-animate")
              .css(property, isVisible ? $element[0][scrollProperty] + 'px' : 0);
          }

        };
      }
    };
  }

  return ngModule;
});