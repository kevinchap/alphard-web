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
(function (global, _exports) {
  'use strict';


  //UTIL
  var __obj, __def, __sym, $$create, $$hasInstance, $$iterator, $$toStringTag, __instanceOf, __extends, __proto, __name, __stack;
  (function (g) {
    __obj = Object.create || function (p) { var c = function () {}; c.prototype = p; return new c(); };
    __def = Object.defineProperty || function (o, p, d) { o[p] = d.value; };
    __sym = g.__sym || function (n) { return g.Symbol ? g.Symbol[n] || g.Symbol(n) : '@@' + n; };
    __instanceOf = g.__instanceOf || function (o, c) { return c[$$hasInstance] ? c[$$hasInstance](o) : o instanceof c; };
    __extends = g.__extends || function (d, b) { for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } } d.prototype = __obj(b.prototype); d.prototype.constructor = d; };
    __proto = g.__proto || function (proto) {
      var a, i, l, d;
      if (Object.getOwnPropertyNames) {
        a = Object.getOwnPropertyNames(proto);
        for (i = 0, l = a.length; i < l; ++i) {
          d = Object.getOwnPropertyDescriptor(proto, a[i]);
          d.enumerable = false;
          __def(proto, a[i], d);
        }
      }
    };
    __stack = g.__stack || Error.captureStackTrace || function (o) { o.stack = (new Error()).stack; };
    __name = g.__name || function (c, n) {
      var cp = c.prototype, s = __sym(n + 'Data');
      c.displayName = n;
      cp[$$toStringTag] = n;
      if (__instanceOf(cp, Error)) { cp.name = n; }
      return function (o) {
        var p = o[s];
        if (!p) { p = {}; __def(o, s, { value: p, enumerable: false, writable: true, configurable: true }); }
        return p;
      };
    };
    $$create = __sym('create');
    $$hasInstance = __sym('hasInstance');
    $$iterator = __sym('iterator');
    $$toStringTag = __sym('toStringTag');
  }(global));


  /**
   * JSONPError class
   *
   */
  var JSONPError = (function (_super) {
    /* jshint latedef:false */
    __extends(JSONPError, _super);
    __name(JSONPError, 'JSONPError');

    /**
     * @constructor
     * @param {*} value
     */
    function JSONPError(message) {
      var result, ctor = JSONPError, self = this;
      if (__instanceOf(this, ctor)) {
        _super.call(this);
        this.message = message;


        __stack(this, this.constructor);
      } else {
        result = __obj(ctor.prototype);
        ctor.apply(result, arguments);
      }
      return result;
    }

    __proto(JSONPError.prototype);
    /* jshint latedef:true */
    return JSONPError;
  }(Error));
  _exports.JSONPError = JSONPError;//export


  /**
   * JSONPRequest class
   *
   *
   */
  var JSONPRequest = (function (_super) {
    __extends(JSONPRequest, _super);
    var __private = __name(JSONPRequest, 'JSONPRequest');
    var __jsonCallback = 'JSON_CALLBACK';

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
      var result, ctor = JSONPRequest, self = this;
      if (__instanceOf(self, ctor)) {
        _super.call(self);

        var _private = __private(self);
        _private.parameterName = 'callback';
        _private.url = '';
      } else {
        result = __obj(ctor.prototype);
        ctor.apply(result, arguments);
      }
      return result;
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
      var _private = __private(this);
      _private.url = url;

      if (opt_parameterName) {
        _private.parameterName = opt_parameterName;
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
      var _private = __private(this);
      var parameterName = str(_private.parameterName);
      var url = str(_private.url);
      var attrName = "_" + (++id);
      var callbackName = "JSONPRequest.callbacks." + attrName;
      var callbacks = JSONPRequest.callbacks;
      var script;

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

    __proto(JSONPRequest.prototype);
    return JSONPRequest;
  }(Object));
  _exports.JSONPRequest = JSONPRequest;//export


  //exports
  //COMMONJS
  if (typeof module !== "undefined") {
    module.exports = JSONPRequest;

  //AMD
  } else if (global.define) {
    global.define("JSONPRequest", [ ], function () { return JSONPRequest; });

  //global
  } else {
    //done
  }


}(this, typeof exports !== 'undefined' ? exports : this));
