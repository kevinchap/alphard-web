define(["module", "angular"], function (module, angular) {
  "use strict";

  //RequireJS configuration
  var config = (module.config && module.config()) || {};
  var DEBUG = config.debug;
  var a = document.createElement("a");

  function debug(var_args) {
    if (DEBUG) {
      var args = ['[' + module.id + ']'];
      for (var i = 0, l = arguments.length; i < l; i++) {
        args.push(arguments[i]);
      }
      console.debug.apply(console, args);
    }
  }

  function parseURL(s) {
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
  }

  debug("config", config);

  /**
   * URLFilter class
   */
  var URLFilter = (function (_super) {
    var __isFunction = angular.isFunction;
    var __strNullable = function (o) { return o === undefined || o === null ? "" : "" + o; };

    function URLFilter(opt_filters) {
      _super.call(this);
      this.filters = opt_filters ? opt_filters.slice() : [];
    }

    //URLFilter.prototype = Object.create(_super.prototype);

    //URLFilter.prototype.constructor = URLFilter;

    URLFilter.prototype.format = function (u) {
      var returnValue = u;
      var filters = this.filters;
      for (var i = 0, filterc = filters.length; i < filterc; i++) {
        returnValue = filters[i](returnValue);
      }
      returnValue = __strNullable(returnValue);
      debug("format(", u, ") ->", returnValue);
      return returnValue;
    };

    URLFilter.prototype.push = function (f) {
      if (!__isFunction(f)) {
        throw new TypeError(f + " must be a function");
      }
      this.filters.push(f);
      return this;
    };

    return URLFilter;
  }(Object));

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
      var $urlFilter = new URLFilter();

      this.push = function (f) {
        $urlFilter.push(f);
        return this;
      };

      this.$get = [function () {

        /**
         * Format/Decorate url `r`
         *
         * @param {string} r
         * @returns {string}
         */
        function $url(r) {
          return $urlFilter.format(r);
        }

        /**
         * Format/Decorate url `u`
         *
         * @param {string} u
         * @returns {string}
         */
        $url.format = function (u) {
          return $urlFilter.format(u);
        };

        /**
         * Utility function to parse url
         *
         * @param {string} s
         * @returns {{protocol: string, hostname: string, host: string, port: string, pathname: string, search: *, hash: string}}
         */
        $url.parse = function (s) {
          return parseURL(s);
        };

        /**
         * Append a new url filter
         *
         * @param {function(s: string): string} f
         */
        $url.push = function (f) {
          $urlFilter.push(f);
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
        return $url.format(s);
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
      var urlFormat = $url.format;

      return {
        priority: 100, // it needs to run after the attributes are interpolated
        link: function ($scope, $element, $attrs) {
          var srcOld;

          $attrs.$observe('src', function (src) {
            if (src !== srcOld) {
              srcOld = src;
              var srcFiltered = urlFormat(src);
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