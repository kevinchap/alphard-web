/**
 * RequireJS smd! plugin
 *
 * Usage:
 *
 *  require(['smd!mymodule'], function (rpcService) { ... });
 *
 */
/*global: define */
define(['module', 'rpc', 'json'], function (module, rpc, json) {
  'use strict';

  //RequireJS module config
  var moduleConfig = (module.config && module.config()) || {};

  /**
   * smd module
   */
  var smd = (function () {
    var cache = {};

    /**
     * @param {string} name
     * @param {function(name: string): string} normalizeFn
     * @return {string}
     */
    function normalize(name, normalizeFn) {
      return String(name);
    }

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
          var jsonRPC = new rpc.Service(jsonContent);
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

    /**
     * Plugin loading definition
     *
     * @param {string} name
     * @param {function} parentRequire
     * @param {function} onLoad
     * @param {object} config
     */
    function load(name, parentRequire, onLoad, config) {
      var url = parentRequire.toUrl(normalize(name));
      var target = _extractTarget(url);
      get(
        url,
        target,
        onLoad,
        onLoad.error
      );
    }

    //util
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

    //exports
    return {
      normalize: normalize,
      get: get,
      load: load
    };
  }());

  return smd;
});
