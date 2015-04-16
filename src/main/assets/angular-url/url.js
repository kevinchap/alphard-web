define(["module", "angular"], function (module, angular) {
  "use strict";

  //RequireJS configuration
  var config = (module.config && module.config()) || {};
  var DEBUG = config.debug;

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

  return angular
    .module(module.id, [])

    /**
     * Decorable Url Service
     *
     * Usage:
     *
     * $urlProvider.push(function (s) {  s += "?foo=bar"; return s; });// or $url.push
     * $url('/path'); //-> path?foo=bar
     */
    .provider("$url", [function () {
      var $provider = this;
      var __isFunction = angular.isFunction;
      var __strNullable = function (o) { return o === undefined || o === null ? o : "" + o; };
      var filters = [];
      var filterc = 0;

      $provider.push = function (f) {
        if (!__isFunction(f)) {
          throw new TypeError(f + " must be a function");
        }
        filters.push(f);
        filterc++;
        return $provider;
      };

      $provider.$get = [function () {
        var a = document.createElement('a');

        /**
         * Format/Decorate url `r`
         *
         * @param {string} r
         * @returns {string}
         */
        function $url(r) {
          return $url.format(r);
        }

        /**
         * Format/Decorate url `u`
         *
         * @param {string} u
         * @returns {string}
         */
        $url.format = function (u) {
          var returnValue = u;
          for (var i = 0; i < filterc; i++) {
            returnValue = filters[i](returnValue);
          }
          returnValue = __strNullable(returnValue);
          debug("format(", u, ") ->", returnValue);
          return returnValue;
        };

        /**
         * Utility function to parse url
         *
         * @param {string} s
         * @returns {{protocol: string, hostname: string, host: string, port: string, pathname: string, search: *, hash: string}}
         */
        $url.parse = function (s) {
          a.href = s;
          return {
            protocol: a.protocol,
            hostname: a.hostname,
            host: a.host,
            port: a.port,
            pathname: a.pathname,
            search: a.search,
            hash: a.hash
          };
        };

        /**
         * Append a new url filter
         *
         * @param {function(s: string): string} f
         */
        $url.push = function (f) {
          $provider.push(f);
        };
        return $url;
      }];
    }])

    /**
     * Url Filter, forwards to $url service
     *
     * Usage:
     *
     * //in javascript
     * $url.push(function (s) {  s += "?foo=bar"; return s; });
     *
     * //in html
     * {{'/path'|url}} <!-- path?foo=bar -->
     */
    .filter("url", ["$url", function ($url) {
      return function url(s) {
        return $url(s);
      };
    }])

    /**
     * <img ng-src="...">
     * =>
     * <img ng-src="...?token=...">
     *
     *
     */
    .directive("img", ["$url", function ($url) {
      return {
        priority: 100, // it needs to run after the attributes are interpolated
        link: function ($scope, $element, $attrs) {
          var srcOld;

          $attrs.$observe('src', function (src) {
            if (src !== srcOld) {
              srcOld = src;
              var srcFiltered = $url(src);
              if (srcFiltered !== src) {
                debug($element[0], "src=", srcFiltered);
                $attrs.$set('src', srcFiltered);
              }
            }
          });
        }
      };
    }]);
});