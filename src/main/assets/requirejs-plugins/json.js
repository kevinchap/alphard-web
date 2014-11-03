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
define(['module', 'text'], function (module, text) {
  'use strict';

  //RequireJS module config
  var moduleConfig = (module.config && module.config()) || {};

  /**
   * json module
   */
  var json = (function () {
    var __jsonCallback = 'JSON_CALLBACK';
    var __jsonpId = 1;
    var __jsonParse = JSON.parse;
    var encode = encodeURIComponent;

    /**
     * @param {string} name
     * @param {function} normalizeFn
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
        _getJSONP(url, opt_callback, opt_errback);
      } else {
        _getText(url, opt_callback, opt_errback);
      }
    }

    /**
     * Plugin loading definition
     *
     * @param {string} name
     * @param {function} req
     * @param {function} onLoad
     * @param {object} config
     */
    function load(name, req, onLoad, config) {
      var url = require.toUrl(normalize(name));
      if (!config.isBuild) {
        get(url, onLoad, onLoad.error);
      } else {
        get("");
      }
    }


    function write(pluginName, moduleName, writeFn) {
      writeFn(_loadFromFileSystem(pluginName, moduleName));
    }

    function _getJSONP(url, opt_callback, opt_errback) {
      var parameterName = 'callback';//String(_private.parameterName);
      var attrName = "_" + (++__jsonpId);
      var callbackName = "requirejs.jsonp." + attrName;
      var callbacks = requirejs.jsonp || (requirejs.jsonp = {});
      var headElement = document.head || document.getElementsByTagName('head')[0];
      var scriptElement;

      //1. form the url
      if (url.indexOf(__jsonCallback) >= 0) {
        url = url.replace(__jsonCallback, encode(callbackName));
      } else {
        url += url.indexOf('?') < 0 ? '?' : '&';
        url += encode(parameterName) + '=' + encode(callbackName);
      }

      //2. set callback
      callbacks[attrName] = function (data) {
        delete callbacks[attrName];
        if (opt_callback) {
          opt_callback(data);
        }
      };

      //3. launch loading (script creation etc)
      scriptElement = _createNode(url,
        function () {
          _removeNode(scriptElement);
        },
        function () {
          if (callbacks[attrName]) {
            delete callbacks[attrName];
          }
          _removeNode(scriptElement);

          //send error to onerror hook or throw error
          var error = new Error('GET ' + url + ' (Loading error)');
          if (opt_errback) {
            opt_errback(error);
          } else {
            throw error;
          }
        }
      );

      headElement.appendChild(scriptElement);
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

    function _createNode(url, onload, onerror) {
      var done = false;
      var scriptElement = document.createElement('script');

      scriptElement.src = url;
      scriptElement.async = true;

      scriptElement.onload =
      scriptElement.onreadystatechange = function () {
        var readyState = this.readyState;
        if (!done &&
          (!readyState ||
          readyState === "loaded" ||
          readyState === "complete")
        ) {
          done = true;
          scriptElement.onload = scriptElement.onreadystatechange = null;

          onload.call(scriptElement);
        }
      };
      scriptElement.onerror = function () {
        if (!done) {
          done = true;
          onerror.call(scriptElement);
        }
      };

      return scriptElement;
    }

    function _removeNode(node) {
      var parent = node.parentNode;
      if (parent) {
        parent.removeChild(node);
      }
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
