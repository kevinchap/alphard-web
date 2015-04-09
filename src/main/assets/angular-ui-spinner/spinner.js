define(["module", "angular"], function (module, angular) {
  "use strict";

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
     * Usage:
     *
     * spinnerTemplate
     *   .compile("myvariant")
     *   .then(function (compiled) {
     *      compiled($scope, function ($ccElement) { ... });
     *   });
     *
     *
     */
    .provider("spinnerTemplate", [function () {

      this.$get = ["$cacheFactory", "$compile", "$http", "$q", "$templateCache",
      function ($cacheFactory, $compile, $http, $q, $templateCache) {
        var $compiledCache = $cacheFactory("spinnerTemplate");
        var $empty = $q.when("");

        function url(variant) {
          return module.id + "--" + variant + ".html";
        }

        function get(variant) {
          var u = url(variant);
          return isDefined(u) ? $http
            .get(u, { cache: $templateCache })
            .then(function (response) {
              return response.data || "";
            }) : $empty;
        }

        function put(variant, templateContent) {
          var u = url(variant);
          if (isDefined(u)) {
            $templateCache.put(u, templateContent);
          }
        }

        function compile(variant) {
          var cacheKey = url(variant);
          var compiled = $compiledCache.get(cacheKey);
          var returnValue;
          debug("spinnerTemplate.compile(" + variant + ")...");
          if (!compiled) {
            returnValue = get(variant)
              .then(function (templateContent) {
                compiled = templateContent ? $compile(templateContent) : null;
                debug("spinnerTemplate.compile(" + variant + ") -> OK");
                $compiledCache.put(cacheKey, compiled);
                return compiled;
              });
          } else {
            debug("spinnerTemplate.compile(" + variant + ") -> OK (from cache)");
            returnValue = $q.when(compiled);
          }
          return returnValue;
        }

        //Default Variant templates
        put(VARIANT_DEFAULT, "");

        return {
          url: url,
          compile: compile,
          get: get,
          put: put
        };
      }];

    }])

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
    .directive("spinner", ["$compile", "spinnerTemplate", function ($compile, spinnerTemplate) {
      var $$class = "spinner";
      var $m = bem($$class, "--");
      var $$classActive = $m("active");

      function _readBoolean(v) {
        return v !== 'false' && v !== false;
      }
      return {
        restrict: "EA",
        scope: {
          name: "@",
          variant: "@",
          active: "@",
          alt: "@"
        },
        compile: function (tElement) {
          tElement
            .attr(ARIA_VALUEMIN, 0)
            .attr(ARIA_VALUEMAX, 100)
            .attr(ROLE, 'progressbar');

          return function link($scope, $element, $attrs) {

            function setContent() {
              var variant = $scope.variant;
              return spinnerTemplate
                .compile(variant)
                .then(function (templateCompiled) {
                  if ($scope.variant === variant) {//safe guard
                    $element.html('');
                    if (templateCompiled) {
                      templateCompiled($scope, function (clonedElement) {
                        $element.append(clonedElement);
                      });
                    }
                  }
                });
            }

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
                setContent();
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
