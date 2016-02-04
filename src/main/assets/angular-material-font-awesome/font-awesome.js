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
   */
  MdFontSet.$name = "mdFontSet";
  function MdFontSet() {
    var FONT_AWESOME = "fa";
    var STYLE =
      'md-icon.fa {' +
      '  visibility: collapse;' +
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
      return icon ? FONT_AWESOME + "-" + icon : null;
    }

    return {
      //priority: 0,
      restrict: "A",
      compile: function ($element, $attrs) {
        return function ($scope, $element, $attrs) {
          if ($attrs[MdFontSet.$name] === FONT_AWESOME) {

            $scope.$watch(
              function () {
                return $element.text().trim();
              },
              function (content, contentOld) {
                $element
                  .removeClass(fa(contentOld))
                  .addClass(fa(content));
              });

          }
        };
      }
    };
  }

  return ngModule;
});