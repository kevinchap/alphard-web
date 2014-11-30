// jshint ignore: start
/**
 * JSONPRequest
 *
 * Usage:
 *  var req = new JSONPRequest();
 *  req.onload = function (jsonData) { ... };
 *  req.onerror = function (e) { ... };
 *  req.open('//api.com/mymethod', 'jsonp');//url, parameterName (default is 'callback')
 *  req.send();
 *
 */
define([], function () {
  'use strict';

  /*jshint evil:true */
  var global = (new Function('return this')).call(null);
  /*jshint evil:false */

  /**
   * jsonp module
   */
  var jsonp = (function () {

    /**
     * JSONPError class
     *
     */
    var JSONPError = (function (_super) {
      /**
       * @constructor
       * @param {*} value
       */
      function JSONPError(message) {
        if (this instanceof JSONPError) {
          _super.call(this);
          this.message = message;
          //__stack(this, this.constructor);
        } else {
          return new JSONPError(message);
        }
      }

      JSONPError.displayName = 'JSONPError';

      JSONPError.prototype = Object.create(_super.prototype);

      JSONPError.prototype.constructor = JSONPError;

      return JSONPError;
    }(Error));

    /**
     * JSONPRequest class
     *
     *
     */
    var JSONPRequest = (function (_super) {
      var JSON_CALLBACK = 'JSON_CALLBACK';
      var GLOBAL_VAR = "__jsonp__";

      var
      str    = String,
      id     = 0,
      doc    = global.document,
      encode = encodeURIComponent,
      head   = doc && doc.getElementsByTagName("head")[0];

      /**
       * @constructor
       */
      function JSONPRequest() {
        if (this instanceof JSONPRequest) {
          _super.call(this);

          this._parameterName = 'callback';
          this._url = '';
        } else {
          return new JSONPRequest();
        }
      }
      JSONPRequest.callbacks = {};

      JSONPRequest.prototype.onload = null;

      JSONPRequest.prototype.onerror = null;

      /**
       * Configure the request to be sent to `url`.
       * The `opt_parameterName` will be added to the request `opt_parameterName={uniqueId}`
       *
       * @param {string} url
       * @param {string=} opt_parameterName
       */
      JSONPRequest.prototype.open = function open(url, opt_parameterName) {
        this._url = url;

        if (opt_parameterName) {
          this._parameterName = opt_parameterName;
        }
        return this;
      };

      /**
       * Send the request
       */
      JSONPRequest.prototype.send = function send() {
        if (!doc || !head) {
          throw new JSONPError("JSONP not supported");
        }

        var self = this;
        var parameterName = str(this._parameterName);
        var url = str(this._url);
        var attrName = "_" + (++id);
        var callbackName = GLOBAL_VAR + "." + attrName;
        var callbacks = global[GLOBAL_VAR] || (global[GLOBAL_VAR] = {});
        var script;

        //1. form the url
        if (url.indexOf(JSON_CALLBACK) >= 0) {
          url = url.replace(JSON_CALLBACK, encode(callbackName));
        } else {
          url += url.indexOf('?') < 0 ? '?' : '&';
          url += encode(parameterName) + '=' + encode(callbackName);
        }

        //2. set callback
        callbacks[attrName] = function (data) {
          delete callbacks[attrName];
          if (self.onload) {
            self.onload(data);
          }
        };

        //3. launch loading (script creation etc)
        script = _createNode(url,
          function () {
            _removeNode(script);
          },
          function () {
            if (callbacks[attrName]) {
              delete callbacks[attrName];
            }
            _removeNode(script);

            //send error to onerror hook or throw error
            var error = new JSONPError('GET ' + url + ' (Loading error)');
            if (self.onerror) {
              self.onerror(error);
            } else {
              throw error;
            }
          }
        );
        head.appendChild(script);
        return this;
      };

      function _createNode(url, onload, onerror) {
        var
        done = false,
        script = doc.createElement('script');

        script.src = url;
        script.async = true;

        script.onload = script.onreadystatechange = function () {
          var readyState = this.readyState;
          if (!done &&
            (!readyState ||
            readyState === "loaded" ||
            readyState === "complete")
          ) {
            done = true;
            script.onload = script.onreadystatechange = null;

            onload.call(script);
          }
        };
        script.onerror = function () {
          if (!done) {
            done = true;
            onerror.call(script);
          }
        };

        return script;
      }

      function _removeNode(node) {
        var parent = node.parentNode;
        if (parent) {
          parent.removeChild(node);
        }
      }
      return JSONPRequest;
    }(Object));


    //exports
    return {
      Error: JSONPError,
      Request: JSONPRequest
    };
  }());

  return jsonp;
});