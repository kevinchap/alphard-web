define(["module", "angular", "angular-material", "angular-flag/flag"], function (module, angular, ngMaterial, ngFlag) {
  "use strict";

  //RequireJS Config
  var config = (module.config && module.config()) || {};
  var DEBUG = config.debug || false;

  //Util
  function debug(var_args) {
    if (DEBUG) {
      var args = ['[' + module.id + ']'];
      for (var i = 0, l = arguments.length; i < l; i++) {
        args.push(arguments[i]);
      }
      console.debug.apply(console, args);
    }
  }

  debug("config", config);

  //angular module
  var ngModule = angular
    .module(module.id, [ngMaterial.name, ngFlag.name])
    .directive("mdFontSet", MdFontSet);

  /**
   * Directive
   *
   * @usage
   *
   * <md-icon md-font-set="flag-icon">DEU<md-icon>
   */
  MdFontSet.$name = "mdFontSet";
  MdFontSet.$inject = ["$flagIcon"];
  function MdFontSet($flagIcon) {
    var FLAG_ICON = "flag-icon";
    var STYLE =
      'md-icon.flag-icon {' +
      '  color: transparent !important;' +
      '  background-size: contain;' +
      '  background-position: 50%;' +
      '  background-repeat: no-repeat;' +
      '}';

    //Include
    angular
      .element(document)
      .find("head")
      .prepend('<style type="text/css">' + STYLE + '</style>');


    return {
      //priority: 0,
      restrict: "A",
      compile: function ($element, $attrs) {
        return function link($scope, $element, $attrs) {
          if ($attrs[MdFontSet.$name] === FLAG_ICON) {

            $scope.$watch(
              function () {
                return $element.text();
              },
              function (content, contentOld) {

                $element.css(
                  "background-image",
                  "url(" + $flagIcon.url(content.trim(), true) + ")"
                );

              });

          }
        };
      }
    };
  }


  return ngModule;
});