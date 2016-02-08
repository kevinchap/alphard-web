define(["module", "angular"], function (module, angular) {
  "use strict";

  console.warn("[" + module.id + "] is deprecated use <md-progress-circular> instead");

  //RequireJS Config
  var config = (module.config && module.config()) || {};
  var ROLE = "progressbar";
  var ARIA_LABEL = "aria-label";
  var ARIA_VALUEMIN = "aria-valuemin";
  var ARIA_VALUEMAX = "aria-valuemax";
  var VARIANT_DEFAULT = config.variant || "default";
  var ALT_DEFAULT = config.alt || "loading";
  var ACTIVE_DEFAULT = true;
  var CSS = ("css" in config) ? config.css : ("css!" + module.id);

  //util
  var isDefined = angular.isDefined;
  function prop(o, name, defaultValue) {
    var val = o[name];
    return isDefined(val) ? val : defaultValue;
  }

  function bem(prefix, sep) {
    return function $bem(opt_suffix) {
      return prefix + (opt_suffix ? sep + String(opt_suffix).toLowerCase() : "");
    };
  }

  function debug(var_args) {
    if (config.debug) {
      var args = ['[' + module.id + ']'];
      for (var i = 0, l = arguments.length; i < l; i++) {
        args.push(arguments[i]);
      }
      console.debug.apply(console, args);
    }
  }

  debug("config", config);
  return angular
    .module(module.id, [])

    /**
     * Spinner directive
     *
     * Usage:
     *
     * <spinner
     *   [variant="default|refresh|..."]
     *   [alt="Hello world"]
     *   [active="true|false"]>
     * </spinner>
     */
    .directive("spinner", ["$templateCache", function ($templateCache) {
      var $$class = "spinner";
      var $m = bem($$class, "--");
      var $$classActive = $m("active");

      function _templateUrl(variant) {
        return module.id + "--" + variant + ".html";
      }

      function _readBoolean(v) {
        return v !== 'false' && v !== false;
      }

      //default template
      $templateCache.put(_templateUrl(VARIANT_DEFAULT), "");

      return {
        restrict: "EA",
        scope: {
          name: "@",
          variant: "@",
          active: "@",
          alt: "@"
        },
        templateUrl: function ($element, $attrs) {
          return _templateUrl($attrs.variant || VARIANT_DEFAULT);
        },
        compile: function (tElement) {
          tElement
            .attr(ARIA_VALUEMIN, 0)
            .attr(ARIA_VALUEMAX, 100)
            .attr(ROLE, 'progressbar');

          return function link($scope, $element, $attrs) {

            //lazyload css
            if (CSS) {
              require([ CSS ]);
            }

            //default values
            $scope.variant = prop($scope, 'variant', VARIANT_DEFAULT);
            $scope.active = prop($scope, 'active', ACTIVE_DEFAULT);
            $scope.alt = prop($scope, 'alt', ALT_DEFAULT);

            //watchers
            $scope.$watch(function () {
              $element.addClass($$class);
            });
            $scope.$watch("variant", function (variant, variantOld) {
              debug("variant=", variant);

              if (variantOld) {
                $element.removeClass($m(variantOld));
              }
              if (variant) {
                //setContent();
                $element.addClass($m(variant));
              }
            });
            $scope.$watch("alt", function (altNew) {
              debug("alt=", altNew);
              $attrs[ARIA_LABEL] = isDefined(altNew) ? altNew : null;
            });
            $scope.$watch("active", function (activeNew) {
              debug("active=", activeNew);
              $element.toggleClass($$classActive, _readBoolean(activeNew));
            });

          };
        }
      };
    }]);
});
