define(["module", "angular", "angular-material"], function (module, angular, ngMaterial) {
  "use strict";

  /**
   * Angular module
   */
  var ngModule = angular
    .module(module.id, [ngMaterial.name])
    .filter("mdTextInitial", mdTextInitialFilter)
    .directive("mdTextIcon", MdTextIconDirective);

  /**
   * @usage
   *
   * {{'Ridane Labardary'|mdTextInitial:2}} // => 'RD'
   */
  function mdTextInitialFilter() {

    /**
     * @param {string} str
     * @param {number=} opt_maxChars
     */
    return function mdTextInitial(str, opt_maxChars) {
      var returnValue = null;
      if (str) {
        var maxChars = (opt_maxChars === undefined) ? 1 : opt_maxChars >>> 0;
        var matches = String(str).match(/\b\w/g);
        if (matches && matches.length >= maxChars) {
          matches = matches.join('');
          returnValue = '';
          for (var i = 0; i < maxChars; i++) {
            returnValue += matches[i];
          }
        }
      }
      return returnValue;
    };
  }

  /**
   *
   * @usage
   *
   * <md-icon md-text-icon
   *          [md-text-icon-size="{@number}"]>
   *   Text here...
   * </md-icon>
   */
  MdTextIconDirective.$inject = ["$filter"];
  function MdTextIconDirective($filter) {
    var STYLE =
      '.md-text-icon {' +
      '  text-transform: uppercase;' +
      '  line-height: 1;' +
      '  text-align: center;' +
      '}';
    var mdTextInitial = $filter("mdTextInitial");

    //Include
    angular
      .element(document)
      .find("head")
      .prepend('<style type="text/css">' + STYLE + '</style>');

    return {
      priority: 1,
      restrict: "A",
      compile: function ($element, $attrs) {
        $attrs.$set("mdFontSet", "md-text-icon");
        $attrs.$addClass("md-text-icon");

        return function ($scope, $element, $attrs) {

          $scope.$watch(function update() {
            var ariaLabel = $attrs.ariaLabel;

            //Update max chars
            var maxChars = parseInt($attrs.mdTextIconSize || "1", 10);

            //Update label
            var textLabel = $element.text() || ariaLabel || "";

            if (textLabel.length > maxChars) {
              $element.text(mdTextInitial(textLabel, maxChars));
            }

            if (!$attrs.ariaLabel) {
              $attrs.$set("ariaLabel", textLabel);
            }
          });
        };
      }
    };
  }

  return ngModule;
});