/**
 * RequireJS async! plugin
 *
 * Usage:
 *
 *  //Load script via JSONP protocol
 *  require(['async!mymodule'], function () { ... });
 *
 *  //-OR-
 *  require(['async!mymodule?callback=JSON_CALLBACK'], function () { ... });
 */
/*global: define */
define(["module"], function (module) {
  "use strict";

  //RequireJS module config
  var moduleConfig = (module.config && module.config()) || {};
  var DEBUG = !!moduleConfig.debug;
  var PARAM_NAME = moduleConfig.paramName || 'callback';

  // Util
  function debug(var_args) {
    if (DEBUG) {
      var args = ['[' + module.id + ']'];
      for (var i = 0, l = arguments.length; i < l; i++) {
        args.push(arguments[i]);
      }
      return console.debug.apply(console, args);
    }
  }
  debug("config", moduleConfig);

  /**
   * async module
   */
  var async = (function () {
    var __encode = encodeURIComponent;
    var __jsonCallback = 'JSON_CALLBACK';
    var __jsonpId = 1;
    var __async = "_async";
    var __formatMessage = function (url, state) {
      return "JSONP " + url + " (" + state + ")";
    };

    /**
     * @param {string} name
     * @param {function(name: string): string} normalizeFn
     * @return {string}
     */
    function normalize(name, normalizeFn) {
      return String(name);
    }

    /**
     *
     * @param {string} url
     * @param {function=} opt_callback
     * @param {function=} opt_errback
     */
    function get(url, opt_callback, opt_errback) {
      var parameterName = PARAM_NAME;
      var attrName = "_" + (++__jsonpId);
      var callbackName = "requirejs." + __async + "." + attrName;
      var callbacks = requirejs[__async] || (requirejs[__async] = {});
      var headElement = _hostElement();
      var scriptElement;

      //1. form the url
      if (url.indexOf(__jsonCallback) >= 0) {
        url = url.replace(__jsonCallback, __encode(callbackName));
      } else {
        url += url.indexOf('?') < 0 ? '?' : '&';
        url += __encode(parameterName) + '=' + __encode(callbackName);
      }

      //2. set callback
      callbacks[attrName] = function (data) {
        delete callbacks[attrName];
        if (opt_callback) {
          opt_callback(data);
        }
      };

      //3. launch loading (script creation etc)
      debug(__formatMessage(url, 'Loading Start'));
      scriptElement = _createNode(url,
        function () {
          debug(__formatMessage(url, 'Loading Success'));
          _removeNode(scriptElement);
        },
        function () {
          debug(__formatMessage(url, 'Loading Failed'));
          if (callbacks[attrName]) {
            delete callbacks[attrName];
          }
          _removeNode(scriptElement);

          //send error to onerror hook or throw error
          var error = new Error(__formatMessage(url, 'Loading error'));
          if (opt_errback) {
            opt_errback(error);
          } else {
            throw error;
          }
        }
      );

      headElement.appendChild(scriptElement);
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
        onLoad(null);//avoid errors
      }
    }

    //util
    function _hostElement() {
      return (
      document.getElementsByTagName('script')[0] ||
      document.getElementsByTagName('head')[0]
      );
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


    //exports
    return {
      normalize: normalize,
      get: get,
      load: load
    };
  }());

  return async;
});

