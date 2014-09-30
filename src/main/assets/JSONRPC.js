// jshint ignore: start
/**
 * JSONRPC
 *
 * Usage:
 *  var req = new JSONPRequest();
 *  req.onload = function (jsonData) { ... };
 *  req.onerror = function (e) { ... };
 *  req.open('//api.com/mymethod', 'jsonp');//url, parameterName (default is 'callback')
 *  req.send();
 *  
 */
(function (global, _exports, undefined) {
  'use strict';

      
  //UTIL
  var __obj, __def, __sym, $$create, $$hasInstance, $$iterator, $$toStringTag, __instanceOf, __extends, __proto, __name, __stack, __throw;
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
    __throw = g.__throw || function (e) { throw e; };
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

  var ostring = Object.prototype.toString;
  var _isString = function (o) { return ostring.call(o) === '[object String]' };
  var _isInteger = function (o) { return o === o|0; };
  var _isArray = Array.isArray || function (o) { return ostring.call(o) === '[object Array]'; };
  var _assertIn = function (o, name) { (name in o) || __throw(new TypeError(name + ' is required')); };



  /**
   * JSONRPCError class
   * 
   */
  var JSONRPCError = (function (_super) {
    __extends(JSONRPCError, _super);
    var __private = __name(JSONRPCError, 'JSONRPCError');
    var __messages = {
      '-32700': 'Parse Error',
      '-32600': 'Invalid Request',
      '-32601': 'Method not found',
      '-32602': 'Invalid params',
      '-32603': 'Internal error',

      //Client errors
      '-31000': 'Parse Error',
      '-31001': 'Invalid Response',
      '-31002': 'Internal error'
    };
  
    /**
     * @constructor
     * @param {string}
     * @param {number} code
     */
    function JSONRPCError(message, code, opt_data) {
      var result, ctor = JSONRPCError, self = this;
      if (__instanceOf(this, ctor)) {
        _super.call(this);
        this.message = message || __messages[code];
        this.code = code;
        this.data = opt_data;

        if (!_isString(this.message)) {
          throw new TypeError('[message] must be an string');
        }
        if (!_isInteger(this.code)) {
          throw new TypeError('[code] must be an integer');
        }
        __stack(this, this.constructor);
      } else {
        result = __obj(ctor.prototype);
        ctor.apply(result, arguments);
      }
      return result;
    }

    JSONRPCError.fromObject = function fromObject(o) {
      _assertIn(o, 'message');
      _assertIn(o, 'code');
      return new JSONRPCError(o.message, o.code, o.data);
    };

    //Server codes
    JSONRPCError.PARSE_ERROR = -32700;
    JSONRPCError.INVALID_REQUEST = -32600;
    JSONRPCError.METHOD_NOT_FOUND = -32601;
    JSONRPCError.INVALID_PARAMS = -32602;
    JSONRPCError.INTERNAL_ERROR = -32603;

    //Client codes
    JSONRPCError.USER_PARSE_ERROR = -31000;
    JSONRPCError.USER_INVALID_RESPONSE = -31001;
    JSONRPCError.USER_INTERNAL_ERROR = -31002;

    /**
     * Error code
     *
     * @type {number}
     */
    JSONRPCError.prototype.code = NaN;

    /**
     * Error data
     *
     * @type {Object=}
     */
    JSONRPCError.prototype.data = null;
  
    __proto(JSONRPCError.prototype);
    return JSONRPCError;
  }(Error));
  _exports.JSONRPCError = JSONRPCError;//export


  /**
   * JSONRPCObject class
   * 
   */
  var JSONRPCObject = (function (_super) {
    __extends(JSONRPCObject, _super);
    var __private = __name(JSONRPCObject, 'JSONRPCObject');
  
    /**
     * @constructor
     */
    function JSONRPCObject(opt_id) {
      var result, ctor = JSONRPCObject, self = this;
      if (__instanceOf(self, ctor)) {
        _super.call(self);
        if (opt_id) {
          self.id = opt_id;
          if (!_isString(opt_id) && !_isInteger(opt_id)) {
            throw new TypeError('[id] must be an string or integer');
          }
        }
      } else {
        result = __obj(ctor.prototype);
        ctor.apply(result, arguments);
      }
      return result;
    }

    /**
     * Unique Request identifier
     *
     * @type {number|string}
     */
    JSONRPCObject.prototype.id = null;


    /**
     * @return {string}
     */
    JSONRPCObject.prototype.toRepresentation = function toRepresentation() {
      var s = '', obj = this.toJSON(), prop, val;
      for (prop in obj) {
        val = obj[prop];
        if (s.length) s += ',';
        s += prop + '=' + val;
      } 
      return this.constructor.displayName + '(' + s + ')';
    };

    /**
     * 
     * @return {string}
     */
    JSONRPCObject.prototype.toJSON = function toJSON() {
      var json = {}, prop, val;
      for (prop in this) {
        val = this[prop];
        if (val != null) {
          json[prop] = val;
        }
      }
      return json;
    };

    /**
     * 
     * @return {string}
     */
    JSONRPCObject.prototype.toString = function toString() {
      return JSON.stringify(this);
    };
  
    __proto(JSONRPCObject.prototype);
    return JSONRPCObject;
  }(Object));
  //_exports.JSONRPCObject = JSONRPCObject;//export

  /**
   * JSONRPCRequest class
   * 
   */
  var JSONRPCRequest = (function (_super) {
    __extends(JSONRPCRequest, _super);
    var __private = __name(JSONRPCRequest, 'JSONRPCRequest');
    //var reMethod = /^[a-zA-Z][a-zA-Z0-9_.]*$/;
  
    /**
     * @constructor
     * @param {string} method
     * @param {object} params
     * @param {*} opt_id
     */
    function JSONRPCRequest(method, opt_params, opt_id) {
      var result, ctor = JSONRPCRequest, self = this;
      if (__instanceOf(self, ctor)) {
        _super.call(this, opt_id);
        this.jsonrpc = this.jsonrpc;
        this.method = method;
        if (opt_params) {
          this.params = opt_params;
        }
      } else {
        result = __obj(ctor.prototype);
        ctor.apply(result, arguments);
      }
      return result;
    }
  
    /**
     * Protocol version
     *
     * @type {string}
     */
    JSONRPCRequest.prototype.jsonrpc = "2.0";

    /**
     * Method requested
     *
     * @type {string}
     */
    JSONRPCRequest.prototype.method = null;

    /**
     * Params passed to the method
     *
     * @type {array|object}
     */
    JSONRPCRequest.prototype.params = null;

    __proto(JSONRPCRequest.prototype);
    return JSONRPCRequest;
  }(JSONRPCObject));
  _exports.JSONRPCRequest = JSONRPCRequest;//export

  /**
   * JSONRPCResponse class
   * 
   */
  var JSONRPCResponse = (function (_super) {
    __extends(JSONRPCResponse, _super);
    var __private = __name(JSONRPCResponse, 'JSONRPCResponse');
  
    /**
     * @constructor
     * @param {*} value
     */
    function JSONRPCResponse(opt_id) {
      var result, ctor = JSONRPCResponse, self = this;
      if (__instanceOf(self, ctor)) {
        _super.call(this, opt_id);
        
      } else {
        result = __obj(ctor.prototype);
        ctor.apply(result, arguments);
      }
      return result;
    }

    JSONRPCResponse.fromObject = function fromObject(o) {
      _assertIn(o, 'id');
      if (!("result" in o)) {
        _assertIn(o, 'error');
      }

      var 
      response = new JSONRPCResponse(o.id), 
      error    = o.error,
      result   = o.result;

      if (error) {
        response.error = JSONRPCError.fromObject(error);
      } 
      if (result) {
        response.result = result;
      }
      return response;
    };

    /**
     * @type {*=}
     */
    JSONRPCResponse.prototype.result = null;

    /**
     * @type {*=}
     */
    JSONRPCResponse.prototype.error = null;

    __proto(JSONRPCResponse.prototype);
    return JSONRPCResponse;
  }(JSONRPCObject));
  _exports.JSONRPCResponse = JSONRPCResponse;//export

  /**
   * JSONRPC module
   * 
   */
  var JSONRPC;
  (function (JSONRPC) { 

    /**
     * @param {string|object} jsonResponse
     * @return {*}
     */
    function parseResponse(stringOrObject) {
      var jsonData, error, result, jsonResponse;

      //check valid json
      if (_isString(stringOrObject)) {
        try {
          jsonData = JSON.parse(stringOrObject);
        } catch (e) {
          jsonResponse = new JSONRPCResponse();
          jsonResponse.error = new JSONRPCError(null, JSONRPCError.USER_PARSE_ERROR, stringOrObject);
        }
      }

      if (!jsonResponse) {
        if (_isArray(jsonData)) {
          jsonResponse = new Array(jsonData.length);
          for (var i = 0, l = stringOrObject.length; i < l; ++i) {
            jsonResponse[i] = _toResponse(stringOrObject[i]);
          }
        } else {
          jsonResponse = _toResponse(stringOrObject);
        }
      }
      return jsonResponse;
    }
    JSONRPC.parseResponse = parseResponse;


    function _toResponse(json) {
      var response;

      //check valid json response
      try {
        response = JSONRPCResponse.fromObject(json);
      } catch (e) {
        if (e instanceof TypeError) {
          response = new JSONRPCResponse();
          response.error = new JSONRPCError(e.message, JSONRPCError.USER_INVALID_RESPONSE, json);
        } else {
          throw e;
        }
      }
      return response;
    }

    JSONRPC.Request = JSONRPCRequest;
    JSONRPC.Error = JSONRPCError;

  }(JSONRPC || (JSONRPC = {})));
  _exports.JSONRPC = JSONRPC;//export

  //COMMONJS
  if (typeof module !== "undefined") {
    module.exports = JSONRPC;
  } 

  //AMD
  if (global.define) {
    global.define("JSONRPC", [ ], function () { return JSONRPC; });
  }


}(this, typeof exports !== 'undefined' ? exports : this));