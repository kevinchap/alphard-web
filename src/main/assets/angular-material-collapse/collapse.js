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
  MdCollapseDirective.$inject = ["$animate", "$$rAF"];
  function MdCollapseDirective($animate, $$rAF) {
    var $$name = "mdCollapse";
    var START = "start";
    var CLOSE = "close";
    var HORIZONTAL = "horizontal";
    var VERTICAL = "vertical";
    var STYLE = (function () {
      var transitionDelay = "200ms";

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

      function vrule(selector, rule) {
        return (
          '[md-collapse="vertical"]' + selector + ',\n' +
          '[md-collapse]:not([md-collapse="horizontal"])' + selector + ' {\n' +
          rule +
          '}\n'
        );
      }

      function hrule(selector, rule) {
        return (
          '[md-collapse="horizontal"]' + selector + ' {\n' +
          rule +
          '}\n'
        );

      }

      return (
        //Vertical
        vrule("", transition("height", transitionDelay)) +
        vrule(".ng-hide", 'overflow-y: hidden;\n') +
        vrule(".ng-hide-remove", 'overflow-y: hidden;\n') +

        //Horizontal
        hrule("", transition("width", transitionDelay)) +
        hrule(".ng-hide", 'overflow-x: hidden;\n') +
        hrule(".ng-hide-remove", 'overflow-x: hidden;\n')
      );
    }());

    //Include
    angular
      .element(document)
      .find("head")
      .prepend('<style type="text/css">' + STYLE + '</style>');

    return {
      restrict: "A",
      priority: 2,
      compile: function () {
        return function link($scope, $element, $attrs) {
          var _init = false;
          $animate.on('addClass', $element, onHide);
          $animate.on('removeClass', $element, onShow);
          $scope.$on("$destroy", onDestroy);

          //Init

          function property() {
            return direction() === HORIZONTAL ? "width" : "height";
          }

          function scrollProperty() {
            return direction() === HORIZONTAL ? "scrollWidth" : "scrollHeight";
          }

          function getFullSize() {
            return $element[0][scrollProperty()];
          }

          function transitionProperty(from, to) {
            var prop = property();
            $element.css(prop, from);
            $$rAF(function () {
              $element.css(prop, to);
            });
          }

          function onHide($element, phase) {
            if (_init) {
              switch (phase) {
                case START:
                  transitionProperty(getFullSize() + 'px', '0');
                  break;
                case CLOSE:
                  $element.css(property(), '');
                  break;
              }
            } else {
              _init = true;
            }
          }

          function onShow($element, phase) {
            if (_init) {
              switch (phase) {
                case START:
                  transitionProperty('0', getFullSize() + 'px');
                  break;
                case CLOSE:
                  $element.css(property(), '');
                  break;
              }
            } else {
              _init = true;
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