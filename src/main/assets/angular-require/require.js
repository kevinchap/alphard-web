define(["module", "require", "angular", "text"], function (module, require, angular) {
  "use strict";

  var moduleConfig = (module.config && module.config()) || {};

  function debug(var_args) {
    if (moduleConfig.debug) {
      var args = ['[' + module.id + ']'];
      for (var i = 0, l = arguments.length; i < l; i++) {
        args.push(arguments[i]);
      }
      console.debug.apply(console, args);
    }
  }

  debug("config", moduleConfig);


  return angular
    .module(module.id, [ "ng" ])

    .config(["$provide", "$templateRequestRequireProvider", function ($provide, $templateRequestRequireProvider) {
      var replace = $templateRequestRequireProvider.config().replace;
      debug("$templateRequestRequire", replace ? "enabled" : "disabled");
      if (replace) {
        $provide.decorator("$templateRequest", ["$templateRequestRequire", function ($templateRequestRequire) {
          return $templateRequestRequire;//override
        }]);
      }
    }])

  /**
   * Generic `require` provider
   */
    .provider("$require", [function () {

      this.$get = ["$q", function ($q) {
        var isArray = angular.isArray;

        function $require(nameOrArray, opt_callback, opt_errback) {
          var returnValue;
          if (isArray(nameOrArray)) {
            returnValue = $q(function (resolve, reject) {
              require(nameOrArray,
                function () {
                  resolve([].slice.call(arguments));
                  if (opt_callback) {
                    opt_callback.apply(this, arguments);
                  }
                },
                function (e) {
                  reject(e);
                  if (opt_errback) {
                    opt_callback.apply(this, arguments);
                  }
                });
            });
          } else {
            returnValue = require(nameOrArray);
          }
          return returnValue;
        }

        return $require;
      }];

    }])

  /**
   * TemplateRequest service implemented with require
   */
    .provider("$templateRequestRequire", [function () {
      var settings = {
        debug: moduleConfig.debug,
        replace: true
      };

      this.config = function config(opt_val) {
        if (opt_val) {
          angular.extend(settings, opt_val);
        } else {
          return settings;
        }
      };

      this.$get = ["$q", "$require", "$sce", "$templateCache", function ($q, $require, $sce, $templateCache) {
        var isString = angular.isString;

        function $templateRequestRequire(url, ignoreRequestError) {
          debug("$templateRequestRequire(", url, ignoreRequestError, ")");

          return $q(function (resolve, reject) {
            $templateRequestRequire.totalPendingRequests += 1;

            function done() {
              $templateRequestRequire.totalPendingRequests -= 1;
            }

            function handleError(e) {
              done();
              debug("$templateRequestRequire(", url, ignoreRequestError, ") -> FAIL", e);
              if (!ignoreRequestError) {
                throw e;
                /*throw $compileMinErr('tpload',
                 'Failed to load template: {0} (HTTP status: {1} {2})',
                 tpl, resp.status, resp.statusText);*/
              }
              reject(e);
            }

            if (!isString(url)) {
              url = $sce.getTrustedResourceUrl(url);
            }

            var templateContent = $templateCache.get(url);
            if (isString(templateContent)) {
              debug("$templateRequestRequire(", url, ignoreRequestError, ") -> OK (cache)");
              resolve(templateContent);
            } else {
              try {
                $require([ "text!" + url ], function (content) {
                  debug("$templateRequestRequire(", url, ignoreRequestError, ") -> OK");
                  $templateCache.put(url, content);
                  done();
                  resolve(content);
                }, handleError);
              } catch (e) {
                handleError(e);
              }

            }
          });
        }

        $templateRequestRequire.totalPendingRequests = 0;

        return $templateRequestRequire;
      }];

    }]);
});