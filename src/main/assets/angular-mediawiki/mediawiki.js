define(["module", "angular"], function (module, angular) {
  "use strict";

  //RequireJS configuration
  var moduleConfig = (module.config && module.config()) || {};
  var LOCALE_DEFAULT = "en";
  var BASE_URL = moduleConfig.baseURL || "https://{{locale}}.wikipedia.org/w/api.php";
  //var PARAM_QUERYCONTINUE = "query-continue";

  //Util
  var extend = angular.extend;
  var forEach = angular.forEach;

  function encodeQuery(q) {
    var s = "";
    forEach(q, function (v, k) {
      if (v !== false && v !== undefined) {
        if (s.length) {
          s += "&";
        }
        s += encodeURIComponent(k);
        if (v !== true) {
          s += '=' + encodeURIComponent(v);
        }
      }
    });
    return s;
  }

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
    .module(module.id, [])

    /**
     * Usage:
     *
     * mediaWiki({
     *   action: 'query', //optional, default query
     *   format: 'xml' //xml|json  optional, default json
     * })
     * .then(function (responseData) {
     *   //process data
     * })
     *
     */
    .provider("mediaWiki", [function () {

      this.$get = ["$http", "$interpolate", "$q", function ($http, $interpolate, $q) {
        function mediaWiki(args, opt_options) {
          return mediaWiki.get(args, opt_options);
        }

        var DOMAIN = mediaWiki.DOMAIN = "wikipedia.org";
        var JSON = mediaWiki.JSON = "json";
        var XML = mediaWiki.XML = "xml";

        var baseURLExpr = $interpolate(BASE_URL);
        var optionsDefault = {
          baseURL: null,
          locale: LOCALE_DEFAULT,
          domain: DOMAIN
        };
        var parametersDefault = {
          action: 'query',
          format: JSON
        };

        mediaWiki.pageURL = function pageURL(opt_options) {
          if (typeof opt_options === "string") {
            opt_options = { page: opt_options };
          }
          var opts = extend({}, optionsDefault, opt_options);

          return "https://" +
            opts.locale + "." + opts.domain +
            "/wiki/" + opts.page;
        };

        mediaWiki.baseURL = function baseURL(options) {
          options = extend({}, optionsDefault, options);
          return options.baseURL || baseURLExpr(options);
        };

        mediaWiki.get = function get(parameters, opt_options) {
          var responseType = "text";
          var url = mediaWiki.baseURL(opt_options);
          var method = "GET";
          var query = extend({}, parametersDefault, parameters);
          var action = query.action;
          switch (query.format) {
            case JSON:
              responseType = JSON;
              method = "JSONP";
              query.callback = "JSON_CALLBACK";
              break;
            case XML:
              responseType = XML;
              break;
          }
          url += (url.indexOf("?") < 0 ? '?' : '&') + encodeQuery(query);

          return $http({
              method: method,
              url: url,
              responseType: responseType
            })
            .then(function (response) {
              var returnValue;
              var data = response.data;
              if (data === undefined || data === null || data === '') {
                returnValue = $q.reject(new Error('OK response but empty result'));
              } else if (data.error) {
                var error = data.error;
                var code = error.code || 'unknown';
                returnValue = $q.reject(new Error(code + ':' + error));
              } else {
                var actionData = data[action];
                //var queryContinue = data[PARAM_QUERYCONTINUE];
                //data[PARAM_QUERYCONTINUE][query.list];
                returnValue = actionData;
              }
              return returnValue;
            });
        };

        return mediaWiki;
      }];

    }]);
});