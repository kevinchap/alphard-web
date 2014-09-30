/**
 * RequireJS smd! plugin
 *
 * Usage:
 *
 *  require(['smd!mymodule'], function (rpcService) { ... });
 *
 */
define(['rpc', 'json'], function (rpc, json) {
  'use strict';


  var smd;
  (function (smd) {
    var cache = {};

    /**
     * @param {string} module
     * @return {string}
     */
    function normalize(module) {
      return String(module);
    }
    smd.normalize = normalize;

    /**
     * @param {string} url
     * @param {string=} opt_target
     * @param {function=} opt_callback
     * @param {function=} opt_errback
     */
    function get(url, opt_target, opt_callback, opt_errback) {
      var jsonContent = cache[url];

      function onLoad(jsonContent) {
        //TODO copy

        //enhance target
        jsonContent.target = jsonContent.target || opt_target || _cleanExt(url);

        try {
          var jsonRPC = rpc.Service(jsonContent);
          if (opt_callback) {
            opt_callback(jsonRPC);
          }
        } catch (e) {
          if (opt_errback) {
            opt_errback(e);
          } else {
            throw e;
          }
        }
      }

      if (jsonContent) {
        onLoad(jsonContent);
      } else {
        json.get(url, onLoad, opt_errback);
      }
    }
    smd.get = get;

    function load(name, req, onLoad, config) {
      var url = require.toUrl(normalize(name));
      var target = _extractTarget(url);
      get(
        url,
        target,
        onLoad,
        onLoad.error
      );
    }
    smd.load = load;

    function _extractTarget(url) {
      var pos;

      pos = url.lastIndexOf('/smd');
      if (pos >= 0) {
        return url.slice(0, pos);
      }
      return url;
    }

    function _cleanExt(s) {
      return s.replace(/(\/|\.)smd$/, "");
    }

  }(smd || (smd = {})));

  return smd;
});
