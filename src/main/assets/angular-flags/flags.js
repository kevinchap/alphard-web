define(["module", "angular"], function (module, angular) {
  "use strict";

  //RequireJS Config
  var config = (module.config && module.config()) || {};
  var DEBUG = config.debug || false;
  var CSS = config.css || "css!flag-icon-css/css/flag-icon";

  //Util
  function str(o) {
    return "" + o;
  }

  function bem(prefix, sep) {
    return function $bem(opt_suffix) {
      return prefix + (opt_suffix ? sep + str(opt_suffix).toLowerCase() : "");
    };
  }

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
  return angular
    .module(module.id, [])

    /**
     * Flag directive
     *
     * Usage:
     *
     * <flag country="fr" [squared="true|false"]></flag>
     */
    .directive("flag", [function () {
      var $$class = "flag-icon";
      var $m = bem($$class, "-");

      function _countryCode(s) {
        var returnValue = str(s);
        returnValue = s.slice(0, 2).toLowerCase();//Take only first two letters
        return returnValue;
      }

      return {
        restrict: "EA",
        scope: {
          squared: "@",
          country: "@"
        },
        compile: function ($element, $attrs) {
          //lazy load CSS
          if (CSS) {
            require([CSS]);
          }
          return function link($scope, $element, $attrs) {

            $scope.$watch(function () { $element.addClass($$class); });
            $scope.$watch("country", function (country, countryOld) {
              debug($element[0], "country=", country);
              $element
                .removeClass($m(_countryCode(countryOld)))
                .addClass($m(_countryCode(country)));
            });
            $scope.$watch("squared", function (squared) {
              debug($element[0], "squared=", squared);
              var isSquared = (squared !== false) && (squared !== "false");
              $element.toggleClass($m("squared"), isSquared);
            });
          };
        }
      };
    }]);
});