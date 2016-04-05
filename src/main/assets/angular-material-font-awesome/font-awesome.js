define(["module", "angular", "angular-material"], function (module, angular, ngMaterial) {
  "use strict";

  /**
   * Module
   */
  var ngModule = angular
    .module(module.id, [ngMaterial.name])
    .directive("mdFontSet", MdFontSet);

  /**
   * Directive
   *
   * @usage
   *
   * <md-icon md-font-set="fa"><md-icon>
   */
  MdFontSet.$name = "mdFontSet";
  function MdFontSet() {
    var FONT_AWESOME = "fa";
    var STYLE =
      'md-icon.fa {' +
      '  visibility: hidden;' +
      '  text-align: center;' +
      '  font-size: 24px;' +
      '}' +
      'md-icon.fa:before {' +
      '  visibility: visible;' +
      '}';

    //Include
    angular
      .element(document)
      .find("head")
      .prepend('<style type="text/css">' + STYLE + '</style>');

    function fa(icon) {
      return icon ? "fa-" + icon.trim() : null;
    }

    return {
      //priority: 0,
      restrict: "A",
      compile: function ($element, $attrs) {
        return function ($scope, $element, $attrs) {
          if ($attrs[MdFontSet.$name] === FONT_AWESOME) {

            $scope.$watch(
              function () {
                return $element.text();
              },
              function (content, contentOld) {
                $attrs.$removeClass(fa(contentOld));
                $attrs.$addClass(fa(content));
              });

          }
        };
      }
    };
  }

  return ngModule;
});