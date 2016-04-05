define(["module", "angular"], function (module, angular) {
  "use strict";

  /**
   * Angular module
   */
  var ngModule = angular
    .module(module.id, [])

    .directive("mdCollapse", MdCollapseDirective);

  /**
   * @usage
   * <tag md-collapse=" |horizontal|vertical"
   *      ng-show="..."
   *      ng-hide="...">
   * </tag>
   */
  MdCollapseDirective.$inject = ["$animate"];
  function MdCollapseDirective($animate) {
    var $$name = "mdCollapse";
    var START = "start";
    var CLOSE = "close";
    var HORIZONTAL = "horizontal";
    var VERTICAL = "vertical";
    var STYLE = (function () {
      var transitionDelay = "300ms";

      function transition(property, delay) {
        var transitionStr = property + ' ' + delay;
        return (
          '  -webkit-transition: ' + transitionStr + ';\n' +
          '  -moz-transition: ' + transitionStr + ';\n' +
          '  -ms-transition: ' + transitionStr + ';\n' +
          '  -o-transition: ' + transitionStr + ';\n' +
          '  transition: ' + transitionStr + ';\n'
        );
      }

      return (
        '[md-collapse="vertical"],\n' +
        '[md-collapse]:not([md-collapse="horizontal"]) {\n' +
        '  overflow-y: hidden;\n' +
        transition("height", transitionDelay) +
        '}\n' +
        '[md-collapse="horizontal"] {\n' +
        '  overflow-x: hidden;\n' +
        transition("width", transitionDelay) +
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
      priority: 1,
      compile: function () {
        return function link($scope, $element, $attrs) {
          $animate.on('addClass', $element, onHide);
          $animate.on('removeClass', $element, onShow);
          $scope.$on("$destroy", onDestroy);

          function property() {
            return direction() === HORIZONTAL ? "width" : "height";
          }

          function scrollProperty() {
            return direction() === HORIZONTAL ? "scrollWidth" : "scrollHeight";
          }

          function onHide($element, phase) {
            switch (phase) {
              case START:
                $element.css(property(), '0px');
                break;
              case CLOSE:
                //$element.css(property(), '');
                break;
            }
          }

          function onShow($element, phase) {
            switch (phase) {
              case START:
                $element.css(property(), $element[0][scrollProperty()] + 'px');
                break;
              case CLOSE:
                //$element.css(property(), '');
                break;
            }
          }

          function direction() {
            return $attrs[$$name] || VERTICAL;
          }

          function onDestroy() {
            $animate.off('addClass', $element, onHide);
            $animate.off('removeClass', $element, onShow);
          }

        };
      }
    };
  }

  return ngModule;
});