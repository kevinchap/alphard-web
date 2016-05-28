/**
 * RequireJS json! plugin
 *
 * Usage:
 *
 *  //json as text then parsed using JSON.parse
 *  require(['json!mymodule'], function (jsonData) { ... });
 *
 *  //-OR-
 *  require(['json!mymodule?callback=JSON_CALLBACK'], function (jsonData) { ... });
 */
/*global: define */
define(['module', 'text', 'async'], function (module, text, async) {
  'use strict';

  //RequireJS module config
  var moduleConfig = (module.config && module.config()) || {};

  /**
   * json module
   */
  var json = (function () {
    var __jsonCallback = 'JSON_CALLBACK';
    var __jsonParse = JSON.parse;
    var __jsonpGet = async.get;

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
     * @param {function=} opt_callback
     * @param {function=} opt_errback
     */
    function get(url, opt_callback, opt_errback) {
      if (url.indexOf(__jsonCallback) >= 0) {
        __jsonpGet(url, opt_callback, opt_errback);
      } else {
        _getText(url, opt_callback, opt_errback);
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
      if (!config.isBuild) {
        get(url, onLoad, onLoad.error);
      } else {
        get("");
      }
    }

    function write(pluginName, moduleName, writeFn) {
      writeFn(_loadFromFileSystem(pluginName, moduleName));
    }

    function _getText(url, opt_callback, opt_errback) {
      text.get(url, function (textContent) {
        try {
          var jsonContent = __jsonParse(textContent);

          //enhance target
          if (opt_callback) {
            opt_callback(jsonContent);
          }
        } catch (e) {
          if (opt_errback) {
            opt_errback(e);
          } else {
            throw e;
          }
        }
      }, opt_errback);
    }

    function _loadFromFileSystem(plugin, name) {

      var fs = nodeRequire("fs");
      var file = require.toUrl(name);
      var val = fs.readFileSync(file).toString();

      val = 'define("' + plugin + '!' + name  + '", function () {\nreturn ' + val + ';\n});\n';

      return val;
    }

    //exports
    return {
      get: get,
      normalize: normalize,
      load: load,
      write: write
    };
  }());


  return json;
});
